import { NextResponse } from "next/server"
import { executeQuery, dbQueries } from "@/lib/database"

// GET /api/tables/:id -> tek masa
export async function GET(_req: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const rows = await executeQuery<any>("SELECT * FROM restaurant_tables WHERE id = ?", [id])
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Masa bulunamadı" }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (err: any) {
    console.error("GET /api/tables/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Beklenmeyen bir hata oluştu" }, { status: 500 })
  }
}

// PATCH /api/tables/:id -> masa güncelle (status, number, capacity)
// Body: { status?: 'musait'|'dolu'|'rezerve'|'temizlik', number?: string, capacity?: number }
export async function PATCH(req: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const body = await req.json()

    const allowedStatuses = new Set(["musait", "dolu", "rezerve", "temizlik"])
    const fields: string[] = []
    const values: any[] = []

    if (typeof body?.number === "string" && body.number.trim().length > 0) {
      fields.push("number = ?")
      values.push(body.number.trim())
    }

    if (typeof body?.capacity !== "undefined") {
      const cap = Number.parseInt(String(body.capacity))
      if (Number.isFinite(cap) && cap > 0) {
        fields.push("capacity = ?")
        values.push(cap)
      }
    }

    if (typeof body?.status === "string") {
      const st = body.status
      if (!allowedStatuses.has(st)) {
        return NextResponse.json({ error: "Geçersiz status" }, { status: 400 })
      }
      // Eğer sadece status gelmişse direkt dbQueries ile de güncelleyebiliriz,
      // fakat aynı sorguda hepsini yönetmek için SQL setine ekliyoruz.
      fields.push("status = ?")
      values.push(st)
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "Güncellenecek alan yok" }, { status: 400 })
    }

    values.push(id)
    await executeQuery("UPDATE restaurant_tables SET " + fields.join(", ") + ", updated_at = NOW() WHERE id = ?", values)

    const rows = await executeQuery<any>("SELECT * FROM restaurant_tables WHERE id = ?", [id])
    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: "Masa bulunamadı" }, { status: 404 })
    }
    return NextResponse.json(rows[0])
  } catch (err: any) {
    console.error("PATCH /api/tables/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Beklenmeyen bir hata oluştu" }, { status: 500 })
  }
}

// DELETE /api/tables/:id -> masa sil
export async function DELETE(_req: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    await executeQuery("DELETE FROM restaurant_tables WHERE id = ?", [id])
    return new NextResponse(null, { status: 204 })
  } catch (err: any) {
    console.error("DELETE /api/tables/[id] error:", err)
    return NextResponse.json({ error: err?.message || "Beklenmeyen bir hata oluştu" }, { status: 500 })
  }
}
