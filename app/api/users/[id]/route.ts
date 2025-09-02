import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

async function ensureUsersTable() {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `)
}

async function getActiveColumn(): Promise<"isActive" | "is_active"> {
  try {
    const hasIsActive = await executeQuery<any>("SHOW COLUMNS FROM users LIKE 'isActive'")
    if (hasIsActive.length) return "isActive" as const
    const hasIs_active = await executeQuery<any>("SHOW COLUMNS FROM users LIKE 'is_active'")
    if (hasIs_active.length) return "is_active" as const
    await executeQuery("ALTER TABLE users ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1")
    return "isActive"
  } catch {
    await ensureUsersTable()
    await executeQuery("ALTER TABLE users ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1")
    return "isActive"
  }
}

function mapUser(row: any, activeCol: "isActive" | "is_active") {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    password: row.password,
    role: row.role,
    isActive: Boolean(row[activeCol] ?? 1),
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  }
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureUsersTable()
    const activeCol = await getActiveColumn()
    const [row] = await executeQuery<any>("SELECT * FROM users WHERE id = ?", [params.id])
    if (!row) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 })
    return NextResponse.json(mapUser(row, activeCol), { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Kullanıcı alınamadı" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureUsersTable()
    const activeCol = await getActiveColumn()

    const body = await request.json()
    const allowed = ["name", "username", "password", "role", "isActive"]
    const updates: Record<string, any> = {}
    for (const k of allowed) {
      if (k in body) updates[k] = body[k]
    }

    const setParts: string[] = []
    const values: any[] = []

    if (typeof updates.name === "string") {
      setParts.push("name = ?")
      values.push(updates.name)
    }
    if (typeof updates.username === "string") {
      setParts.push("username = ?")
      values.push(updates.username)
    }
    if (typeof updates.password === "string") {
      setParts.push("password = ?")
      values.push(updates.password)
    }
    if (typeof updates.role === "string") {
      setParts.push("role = ?")
      values.push(updates.role)
    }
    if (typeof updates.isActive !== "undefined") {
      setParts.push(`${activeCol} = ?`)
      values.push(updates.isActive ? 1 : 0)
    }

    // updated_at varsa onu da otomatik güncelle
    const hasUpdatedAt = await executeQuery<any>("SHOW COLUMNS FROM users LIKE 'updated_at'")
    if (hasUpdatedAt.length) {
      setParts.push("updated_at = NOW()")
    }

    if (!setParts.length) {
      return NextResponse.json({ error: "Güncellenecek alan bulunamadı" }, { status: 400 })
    }

    values.push(params.id)
    await executeQuery(`UPDATE users SET ${setParts.join(", ")} WHERE id = ?`, values)

    const [row] = await executeQuery<any>("SELECT * FROM users WHERE id = ?", [params.id])
    return NextResponse.json(mapUser(row, activeCol), { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Kullanıcı güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await ensureUsersTable()
    const activeCol = await getActiveColumn()
    // Soft delete
    await executeQuery(`UPDATE users SET ${activeCol} = 0 WHERE id = ?`, [params.id])
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Kullanıcı silinemedi" }, { status: 500 })
  }
}
