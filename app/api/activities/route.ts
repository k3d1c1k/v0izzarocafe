import { NextResponse } from "next/server"

type ExecFn = (sql: string, params?: any[]) => Promise<any[]>

async function getExecutor(): Promise<ExecFn> {
  // Önce projedeki lib/database içindeki executeQuery'yi kullanmayı dene
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const mod: any = await import("@/lib/database")
    if (mod?.executeQuery) {
      return async (sql: string, params?: any[]) => {
        return (await mod.executeQuery(sql, params)) as any[]
      }
    }
  } catch {
    // yoksay: fallback'e geçilecek
  }

  // Fallback: mysql2/promise ile doğrudan bağlantı (env varsa)
  const { createPool } = await import("mysql2/promise")
  const pool = createPool({
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "restaurant_pos",
    port: Number(process.env.DB_PORT || 3306),
    connectionLimit: 5,
    namedPlaceholders: false,
  })
  return async (sql: string, params?: any[]) => {
    const [rows] = await pool.query(sql, params ?? [])
    // @ts-ignore
    return rows as any[]
  }
}

async function ensureActivityTable(exec: ExecFn) {
  await exec(
    `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id            VARCHAR(64)  NOT NULL PRIMARY KEY,
      type          VARCHAR(64)  NOT NULL,
      description   TEXT         NOT NULL,
      user_id       VARCHAR(64)  NULL,
      user_name     VARCHAR(191) NULL,
      table_id      VARCHAR(64)  NULL,
      table_number  VARCHAR(64)  NULL,
      order_id      VARCHAR(64)  NULL,
      amount        DECIMAL(10,2) NULL,
      details       JSON         NULL,
      created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
    `,
  )
  // Sorgu performansı için basit indeksler
  await exec(`CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs (created_at)`)
  await exec(`CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs (type)`)
}

function safeParseJSON(value: any) {
  try {
    if (value == null) return null
    if (typeof value === "string") return JSON.parse(value)
    return value
  } catch {
    return null
  }
}

function toCamel(row: any) {
  return {
    id: row.id,
    type: row.type,
    description: row.description,
    userId: row.user_id ?? null,
    userName: row.user_name ?? null,
    tableId: row.table_id ?? null,
    tableNumber: row.table_number ?? null,
    orderId: row.order_id ?? null,
    amount: row.amount != null ? Number(row.amount) : null,
    details: safeParseJSON(row.details),
    createdAt: row.created_at,
  }
}

type Where = { clause: string; params: any[] }

function buildWhere(params: URLSearchParams): Where {
  const clauses: string[] = []
  const values: any[] = []

  const type = params.get("type")
  const userId = params.get("userId")
  const tableId = params.get("tableId")
  const start = params.get("start")
  const end = params.get("end")
  const today = params.get("today")

  if (type) {
    clauses.push("type = ?")
    values.push(type)
  }
  if (userId) {
    clauses.push("user_id = ?")
    values.push(userId)
  }
  if (tableId) {
    clauses.push("table_id = ?")
    values.push(tableId)
  }
  if (today === "1" || today === "true") {
    clauses.push("DATE(created_at) = CURDATE()")
  } else {
    if (start) {
      clauses.push("created_at >= ?")
      values.push(new Date(start))
    }
    if (end) {
      clauses.push("created_at <= ?")
      values.push(new Date(end))
    }
  }

  if (clauses.length === 0) return { clause: "", params: [] }
  return { clause: "WHERE " + clauses.join(" AND "), params: values }
}

// GET /api/activities
export async function GET(req: Request) {
  try {
    const exec = await getExecutor()
    const url = new URL(req.url)
    const { clause, params } = buildWhere(url.searchParams)

    const limitParam = url.searchParams.get("limit")
    const limit = limitParam ? Math.max(1, Math.min(1000, Number.parseInt(limitParam))) : undefined

    let sql = `
      SELECT id, type, description, user_id, user_name, table_id, table_number, order_id, amount, details, created_at
      FROM activity_logs
      ${clause}
      ORDER BY created_at DESC
    `
    const finalParams = [...params]
    if (limit) {
      sql += " LIMIT ?"
      finalParams.push(limit)
    }

    const rows = await exec(sql, finalParams)
    return NextResponse.json(rows.map(toCamel))
  } catch (err: any) {
    // Eğer tablo yoksa otomatik oluşturup boş liste döndür
    try {
      const exec = await getExecutor()
      await ensureActivityTable(exec)
      return NextResponse.json([])
    } catch {}
    return NextResponse.json({ error: "Aktivite kayıtları alınamadı", details: err?.message }, { status: 500 })
  }
}

// POST /api/activities
export async function POST(req: Request) {
  const exec = await getExecutor()
  try {
    const body = await req.json()
    const id =
      body.id ??
      (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`)

    const {
      type,
      description,
      userId = null,
      userName = null,
      tableId = null,
      tableNumber = null,
      orderId = null,
      amount = null,
      details = null,
    } = body || {}

    if (!type || !description) {
      return NextResponse.json({ error: "type ve description zorunludur" }, { status: 400 })
    }

    // Tabloyu güvenceye al
    await ensureActivityTable(exec)

    await exec(
      `
      INSERT INTO activity_logs
        (id, type, description, user_id, user_name, table_id, table_number, order_id, amount, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        id,
        String(type),
        String(description),
        userId,
        userName,
        tableId,
        tableNumber,
        orderId,
        amount,
        details ? JSON.stringify(details) : null,
      ],
    )

    const [row] = await exec("SELECT * FROM activity_logs WHERE id = ? LIMIT 1", [id])
    return NextResponse.json(toCamel(row), { status: 201 })
  } catch (err: any) {
    // Eğer tablo yoksa bir kez oluşturup yeniden dene
    try {
      await ensureActivityTable(exec)
      // retry once
      const body = await req.json().catch(() => null)
      if (body && body.type && body.description) {
        const retryReq = new Request(req.url, {
          method: "POST",
          headers: req.headers,
          body: JSON.stringify(body),
        })
        // recursive call would be messy; insert directly:
        const id =
          body.id ??
          (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.floor(Math.random() * 1e6)}`)
        await exec(
          `
          INSERT INTO activity_logs
            (id, type, description, user_id, user_name, table_id, table_number, order_id, amount, details)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
          [
            id,
            String(body.type),
            String(body.description),
            body.userId ?? null,
            body.userName ?? null,
            body.tableId ?? null,
            body.tableNumber ?? null,
            body.orderId ?? null,
            body.amount ?? null,
            body.details ? JSON.stringify(body.details) : null,
          ],
        )
        const [row] = await exec("SELECT * FROM activity_logs WHERE id = ? LIMIT 1", [id])
        return NextResponse.json(toCamel(row), { status: 201 })
      }
    } catch (_) {
      // yoksay
    }
    return NextResponse.json({ error: "Aktivite kaydı oluşturulamadı", details: err?.message }, { status: 500 })
  }
}
