import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import { type MenuItem, type MenuCategory } from "@/lib/types"

// mysql2/promise sadece ihtiyaç olursa dinamik import edilecek
let mysqlModule: any | null = null
let mysqlPool: any | null = null

type CreateMenuPayload = {
  name: string
  description: string
  price: number
  category: MenuCategory
  preparationTime: number
  available: boolean
}
type UpdateMenuPayload = Partial<CreateMenuPayload>
type ListOptions = { search?: string; includeInactive?: boolean }

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "menu.json")

function hasMysqlConfig() {
  return !!process.env.DB_HOST && !!process.env.DB_USER && !!process.env.DB_NAME
}

async function getPool(): Promise<any | null> {
  if (!hasMysqlConfig()) return null
  if (mysqlPool) return mysqlPool
  if (!mysqlModule) {
    try {
      mysqlModule = await import("mysql2/promise")
    } catch {
      // mysql2 kurulu değilse JSON fallback kullanılacak
      return null
    }
  }
  const mysql = mysqlModule.default || mysqlModule
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
    waitForConnections: true,
    connectionLimit: 5,
    multipleStatements: false,
    supportBigNumbers: true,
    dateStrings: false,
  })
  return mysqlPool
}

async function ensureFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8")
  }
}

async function readJson(): Promise<MenuItem[]> {
  await ensureFile()
  const raw = await fs.readFile(DATA_FILE, "utf-8")
  return JSON.parse(raw) as MenuItem[]
}
async function writeJson(items: MenuItem[]) {
  await ensureFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8")
}

function mapDbRow(row: any): MenuItem {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description || "",
    price: Number(row.price),
    category: row.category as MenuCategory,
    preparationTime: Number(row.preparation_time ?? row.preparationTime ?? 15),
    available: row.available === 1 || row.available === true,
    createdAt: row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updated_at ?? row.updatedAt ?? null,
  } as MenuItem
}

export const menuService = {
  async getAllMenuItems(opts: ListOptions = {}): Promise<MenuItem[]> {
    const { search = "", includeInactive = false } = opts
    const pool = await getPool()
    if (pool) {
      const clauses: string[] = []
      const params: any[] = []
      if (!includeInactive) clauses.push("available = 1")
      if (search) {
        clauses.push("(name LIKE ? OR description LIKE ?)")
        params.push(`%${search}%`, `%${search}%`)
      }
      const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : ""
      const [rows] = await pool.query(
        `
        SELECT id, name, description, price, category, available, preparation_time, created_at, updated_at
        FROM menu_items
        ${where}
        ORDER BY name ASC
        `,
        params
      )
      return (rows as any[]).map(mapDbRow)
    }

    // JSON fallback
    const data = await readJson()
    let filtered = [...data]
    if (!includeInactive) filtered = filtered.filter((i) => i.available)
    if (search) {
      const s = search.toLowerCase()
      filtered = filtered.filter(
        (i) =>
          i.name.toLowerCase().includes(s) ||
          (i.description || "").toLowerCase().includes(s)
      )
    }
    return filtered.sort((a, b) => a.name.localeCompare(b.name))
  },

  async getMenuItemsByCategory(
    category: MenuCategory,
    opts: ListOptions = {}
  ): Promise<MenuItem[]> {
    const { search = "", includeInactive = false } = opts
    const pool = await getPool()
    if (pool) {
      const clauses: string[] = ["category = ?"]
      const params: any[] = [category]
      if (!includeInactive) clauses.push("available = 1")
      if (search) {
        clauses.push("(name LIKE ? OR description LIKE ?)")
        params.push(`%${search}%`, `%${search}%`)
      }
      const where = `WHERE ${clauses.join(" AND ")}`
      const [rows] = await pool.query(
        `
        SELECT id, name, description, price, category, available, preparation_time, created_at, updated_at
        FROM menu_items
        ${where}
        ORDER BY name ASC
        `,
        params
      )
      return (rows as any[]).map(mapDbRow)
    }

    const items = await this.getAllMenuItems({ search, includeInactive })
    return items.filter((i) => i.category === category)
  },

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    const pool = await getPool()
    if (pool) {
      const [rows] = await pool.query(
        `
        SELECT id, name, description, price, category, available, preparation_time, created_at, updated_at
        FROM menu_items WHERE id = ?
        `,
        [id]
      )
      const row = (rows as any[])[0]
      return row ? mapDbRow(row) : null
    }

    const data = await readJson()
    return data.find((i) => i.id === id) ?? null
  },

  async createMenuItem(payload: CreateMenuPayload): Promise<MenuItem> {
    const pool = await getPool()
    if (pool) {
      const [result] = await pool.query(
        `
        INSERT INTO menu_items (name, description, price, category, available, preparation_time, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          payload.name,
          payload.description || "",
          payload.price,
          payload.category,
          payload.available ? 1 : 0,
          payload.preparationTime || 15,
        ]
      )
      // @ts-expect-error: mysql2 ok packet
      const insertId: string | null = result?.insertId ? String(result.insertId) : null
      const id = insertId ?? crypto.randomUUID()

      const found = await this.getMenuItemById(id)
      if (found) return found
      return {
        id,
        ...payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as MenuItem
    }

    // JSON fallback
    const data = await readJson()
    const item: MenuItem = {
      id: crypto.randomUUID(),
      name: payload.name,
      description: payload.description || "",
      price: payload.price,
      category: payload.category,
      preparationTime: payload.preparationTime || 15,
      available: payload.available,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as MenuItem
    data.push(item)
    await writeJson(data)
    return item
  },

  async updateMenuItem(id: string, payload: UpdateMenuPayload): Promise<MenuItem> {
    const pool = await getPool()
    if (pool) {
      const fields: string[] = []
      const params: any[] = []
      if (payload.name !== undefined) { fields.push("name = ?"); params.push(payload.name) }
      if (payload.description !== undefined) { fields.push("description = ?"); params.push(payload.description) }
      if (payload.price !== undefined) { fields.push("price = ?"); params.push(payload.price) }
      if (payload.category !== undefined) { fields.push("category = ?"); params.push(payload.category) }
      if (payload.preparationTime !== undefined) { fields.push("preparation_time = ?"); params.push(payload.preparationTime) }
      if (payload.available !== undefined) { fields.push("available = ?"); params.push(payload.available ? 1 : 0) }

      if (fields.length) {
        params.push(id)
        await pool.query(`UPDATE menu_items SET ${fields.join(", ")}, updated_at = NOW() WHERE id = ?`, params)
      }
      const updated = await this.getMenuItemById(id)
      if (!updated) throw new Error("Öğe bulunamadı")
      return updated
    }

    // JSON fallback
    const data = await readJson()
    const idx = data.findIndex((i) => i.id === id)
    if (idx === -1) throw new Error("Öğe bulunamadı")
    const updated: MenuItem = {
      ...data[idx],
      ...payload,
      updatedAt: new Date().toISOString(),
    } as MenuItem
    data[idx] = updated
    await writeJson(data)
    return updated
  },

  async deleteMenuItem(id: string): Promise<void> {
    const pool = await getPool()
    if (pool) {
      await pool.query(`DELETE FROM menu_items WHERE id = ?`, [id])
      return
    }

    const data = await readJson()
    const filtered = data.filter((i) => i.id !== id)
    await writeJson(filtered)
  },

  async getAllMenuItemsIncludingInactive(): Promise<MenuItem[]> {
    return this.getAllMenuItems({ includeInactive: true })
  },
}
