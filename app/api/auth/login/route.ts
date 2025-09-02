import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { executeQuery } from "@/lib/database"

// Basit rol sabitleri: lib/types içindeki isimlerle uyumlu olmalı
const Roles = {
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  CASHIER: "CASHIER",
  WAITER: "WAITER",
  KITCHEN: "KITCHEN",
} as const

type Role = typeof Roles[keyof typeof Roles]

type DemoUser = {
  username: string
  password: string
  name: string
  role: Role
  isActive?: boolean
}

// Uygulamadaki demo butonlarıyla eşleşen kullanıcılar
const DEMO_USERS: Record<string, DemoUser> = {
  admin: { username: "admin", password: "admin123", name: "Yönetici", role: Roles.ADMIN, isActive: true },
  mehmet: { username: "mehmet", password: "123456", name: "Müdür Mehmet", role: Roles.MANAGER, isActive: true },
  ayse: { username: "ayse", password: "123456", name: "Kasiyer Ayşe", role: Roles.CASHIER, isActive: true },
  ahmet: { username: "ahmet", password: "123456", name: "Garson Ahmet", role: Roles.WAITER, isActive: true },
  kemal: { username: "kemal", password: "123456", name: "Mutfak Kemal", role: Roles.KITCHEN, isActive: true },
}

// users tablosunun kolonlarını keşfetmek için yardımcı
async function getUserColumns() {
  try {
    const cols = (await executeQuery("SHOW COLUMNS FROM users")) as { Field: string }[]
    const names = cols.map((c) => c.Field)
    const activeCol = names.includes("is_active") ? "is_active" : names.includes("isActive") ? "isActive" : null
    const createdCol = names.includes("created_at")
      ? "created_at"
      : names.includes("createdAt")
        ? "createdAt"
        : null
    const updatedCol = names.includes("updated_at")
      ? "updated_at"
      : names.includes("updatedAt")
        ? "updatedAt"
        : null
    return { names, activeCol, createdCol, updatedCol }
  } catch {
    // Tablo yoksa oluşturalım
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NULL,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    return {
      names: ["id", "name", "username", "password", "role", "is_active", "created_at", "updated_at"],
      activeCol: "is_active",
      createdCol: "created_at",
      updatedCol: "updated_at",
    }
  }
}

async function findUserByUsername(username: string) {
  const rows = (await executeQuery("SELECT * FROM users WHERE username = ? LIMIT 1", [username])) as any[]
  return rows?.[0] ?? null
}

async function createUserIfMissing(demo: DemoUser) {
  const { names, activeCol, createdCol } = await getUserColumns()
  const cols: string[] = []
  const params: any[] = []

  // Dinamik kolon seti
  if (names.includes("name")) {
    cols.push("name")
    params.push(demo.name)
  }
  cols.push("username")
  params.push(demo.username)

  cols.push("password")
  params.push(demo.password) // Not: Demo için plain text. Gerçekte hash kullanın.

  cols.push("role")
  params.push(demo.role)

  if (activeCol) {
    cols.push(activeCol)
    params.push(demo.isActive ? 1 : 0)
  }
  if (createdCol) {
    cols.push(createdCol)
    params.push(new Date())
  }

  const placeholders = cols.map(() => "?").join(",")
  const sql = `INSERT INTO users (${cols.join(",")}) VALUES (${placeholders})`
  await executeQuery(sql, params)

  return await findUserByUsername(demo.username)
}

export async function POST(req: Request) {
  try {
    const { username, password } = (await req.json().catch(() => ({}))) as {
      username?: string
      password?: string
    }

    if (!username || !password) {
      return NextResponse.json({ error: "Kullanıcı adı ve şifre zorunludur" }, { status: 400 })
    }

    // Tablo ve kolonları hazırla
    await getUserColumns()

    // Kullanıcıyı bul
    let user = await findUserByUsername(username)

    // Yoksa DEMO ise oluştur
    if (!user && DEMO_USERS[username]) {
      user = await createUserIfMissing(DEMO_USERS[username])
    }

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 401 })
    }

    // Aktif mi?
    const isActive = user.is_active ?? user.isActive ?? 1
    if (!isActive) {
      return NextResponse.json({ error: "Hesap pasif" }, { status: 403 })
    }

    // Şifre kontrolü (demo: plain text)
    if (String(user.password) !== String(password)) {
      return NextResponse.json({ error: "Şifre hatalı" }, { status: 401 })
    }

    // Giriş başarılı: kimlik bilgilerini cookie olarak yaz
    const c = cookies()
    c.set("user_id", String(user.id), { path: "/" })
    c.set("user_name", String(user.name ?? user.username ?? "Kullanıcı"), { path: "/" })
    c.set("user_role", String(user.role), { path: "/" })

    const safeUser = {
      id: user.id,
      name: user.name ?? user.username,
      username: user.username,
      role: user.role as Role,
      isActive: Boolean(isActive),
      createdAt: user.created_at ?? user.createdAt ?? null,
    }

    return NextResponse.json(safeUser)
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Giriş başarısız" }, { status: 500 })
  }
}
