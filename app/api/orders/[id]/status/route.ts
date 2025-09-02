import { NextResponse } from "next/server"
import { headers, cookies } from "next/headers"
import { executeQuery } from "@/lib/database"

// Normalize role from header/cookie to canonical ids
function normalizeRole(role?: string | null) {
  const r = (role || "").toString().trim().toLowerCase()
  if (!r) return null
  if (["admin", "yönetici"].includes(r)) return "admin"
  if (["mutfak", "kitchen", "kitchen_staff"].includes(r)) return "kitchen"
  if (["garson", "waiter"].includes(r)) return "waiter"
  if (["kasiyer", "cashier"].includes(r)) return "cashier"
  return r
}

function isValidStatus(s: unknown): s is "bekliyor" | "hazirlaniyor" | "hazir" | "tamamlandi" {
  return typeof s === "string" && ["bekliyor", "hazirlaniyor", "hazir", "tamamlandi"].includes(s)
}

// Activity log insert that adapts to available columns
async function insertActivityLog(data: {
  type: string
  description: string
  orderId?: string | number
  userId?: string | number | null
  userName?: string | null
}) {
  try {
    const columns = (await executeQuery("SHOW COLUMNS FROM activity_logs", [])) as Array<{ Field: string }>
    const names = new Set(columns?.map((c) => c.Field) || [])

    const colNames: string[] = []
    const placeholders: string[] = []
    const values: any[] = []

    const pushCol = (name: string, value: any) => {
      colNames.push(name)
      placeholders.push("?")
      values.push(value)
    }

    // Required-ish
    if (names.has("type")) pushCol("type", data.type)
    else if (names.has("activity_type")) pushCol("activity_type", data.type)

    if (names.has("description")) pushCol("description", data.description)

    const now = new Date()
    if (names.has("created_at")) pushCol("created_at", now)
    else if (names.has("createdAt")) pushCol("createdAt", now)

    // Optional mappings
    if (data.orderId !== undefined) {
      if (names.has("orderId")) pushCol("orderId", data.orderId)
      else if (names.has("order_id")) pushCol("order_id", data.orderId)
    }
    if (data.userId !== undefined) {
      if (names.has("userId")) pushCol("userId", data.userId)
      else if (names.has("user_id")) pushCol("user_id", data.userId)
    }
    if (data.userName !== undefined) {
      if (names.has("userName")) pushCol("userName", data.userName)
      else if (names.has("user_name")) pushCol("user_name", data.userName)
    }

    if (colNames.length === 0) return

    const sql = `INSERT INTO activity_logs (${colNames.join(",")}) VALUES (${placeholders.join(",")})`
    await executeQuery(sql, values)
  } catch {
    // Swallow logging errors to avoid blocking main flow
  }
}

export async function PATCH(
  req: Request,
  ctx: { params: { id: string } },
) {
  const orderId = ctx.params.id
  try {
    const hdrs = headers()
    const cookieStore = cookies()
    const roleHeader = hdrs.get("x-user-role")
    const roleCookie = cookieStore.get("user_role")?.value || cookieStore.get("role")?.value
    const role = normalizeRole(roleHeader || roleCookie)

    const userId =
      cookieStore.get("user_id")?.value ||
      cookieStore.get("uid")?.value ||
      undefined
    const userName =
      cookieStore.get("user_name")?.value ||
      cookieStore.get("username")?.value ||
      undefined

    const body = (await req.json().catch(() => ({}))) as { status?: string }
    const nextStatus = body?.status

    if (!isValidStatus(nextStatus)) {
      return NextResponse.json({ error: "Geçersiz durum" }, { status: 400 })
    }

    // Fetch current status
    const rows = (await executeQuery("SELECT status FROM orders WHERE id = ? LIMIT 1", [orderId])) as Array<{
      status: "bekliyor" | "hazirlaniyor" | "hazir" | "tamamlandi"
    }>
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 })
    }
    const currentStatus = rows[0].status

    // Authorization rules
    // - cashier: forbidden
    // - waiter: only hazir -> tamamlandi
    // - admin/kitchen: any transition
    if (role === "cashier" || role === null) {
      return NextResponse.json({ error: "Yetkisiz kullanıcı" }, { status: 403 })
    }
    if (role === "waiter") {
      const allowed = currentStatus === "hazir" && nextStatus === "tamamlandi"
      if (!allowed) {
        return NextResponse.json({ error: "Garson yalnızca servisi tamamlayabilir" }, { status: 403 })
      }
    }

    // Update
    await executeQuery("UPDATE orders SET status = ? WHERE id = ?", [nextStatus, orderId])

    // Audit
    const type = nextStatus === "tamamlandi" ? "ORDER_COMPLETED" : "ORDER_STATUS_CHANGED"
    const roleLabel =
      role === "admin" ? "Yönetici" : role === "kitchen" ? "Mutfak" : role === "waiter" ? "Garson" : "Kullanıcı"
    const description =
      nextStatus === "tamamlandi"
        ? `${roleLabel} tarafından sipariş servisi tamamlandı`
        : `${roleLabel} tarafından sipariş durumu ${currentStatus} → ${nextStatus} olarak güncellendi`

    await insertActivityLog({
      type,
      description,
      orderId,
      userId: userId ? Number(userId) || userId : undefined,
      userName: userName ?? undefined,
    })

    return NextResponse.json({ ok: true, id: orderId, status: nextStatus })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Sipariş durumu güncellenemedi" }, { status: 500 })
  }
}
