import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/database"

// Kolon adlarını mevcut tablo şemasına göre tespit eder
async function getActiveColumn(): Promise<"isActive" | "is_active"> {
  try {
    const hasIsActive = await executeQuery<any>("SHOW COLUMNS FROM users LIKE 'isActive'")
    if (hasIsActive.length) return "isActive" as const
    const hasIs_active = await executeQuery<any>("SHOW COLUMNS FROM users LIKE 'is_active'")
    if (hasIs_active.length) return "is_active" as const
    // İkisi de yoksa ekleyelim
    await executeQuery("ALTER TABLE users ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1")
    return "isActive"
  } catch {
    // Tablo yoksa oluşturup tekrar dener
    await ensureUsersTable()
    await executeQuery("ALTER TABLE users ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1")
    return "isActive"
  }
}

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

export async function GET(request: Request) {
  try {
    await ensureUsersTable()
    const activeCol = await getActiveColumn()

    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim()
    const role = searchParams.get("role")?.trim()

    const conditions: string[] = [`${activeCol} = 1`]
    const params: any[] = []

    if (q) {
      conditions.push("(name LIKE ? OR username LIKE ?)")
      params.push(`%${q}%`, `%${q}%`)
    }
    if (role) {
      conditions.push("role = ?")
      params.push(role)
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const rows = await executeQuery<any>(`SELECT * FROM users ${where} ORDER BY created_at DESC`, params)
    const data = rows.map((r) => mapUser(r, activeCol))
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Kullanıcılar alınamadı" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureUsersTable()
    const activeCol = await getActiveColumn()

    const body = await request.json()
    const { name, username, password, role } = body || {}
    if (!name?.trim() || !username?.trim() || !password?.trim() || !role?.trim()) {
      return NextResponse.json({ error: "Lütfen tüm alanları doldurun" }, { status: 400 })
    }

    // Benzersiz kullanıcı adı
    const existing = await executeQuery<any>("SELECT id FROM users WHERE username = ?", [username])
    if (existing.length) {
      return NextResponse.json({ error: "Bu kullanıcı adı zaten kullanılıyor" }, { status: 409 })
    }

    const id = Date.now().toString()
    await executeQuery(
      `INSERT INTO users (id, name, username, password, role, ${activeCol}) VALUES (?, ?, ?, ?, ?, 1)`,
      [id, name, username, password, role],
    )

    const [inserted] = await executeQuery<any>("SELECT * FROM users WHERE id = ?", [id])
    return NextResponse.json(mapUser(inserted, activeCol), { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Kullanıcı oluşturulamadı" }, { status: 500 })
  }
}
