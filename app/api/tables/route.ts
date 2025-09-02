import { NextResponse } from "next/server"
import { dbQueries, executeQuery } from "@/lib/database"

// GET /api/tables -> tüm masalar
export async function GET() {
  try {
    const tables = await dbQueries.getAllTables()
    return NextResponse.json(tables)
  } catch (err: any) {
    console.error("GET /api/tables error:", err)
    return NextResponse.json({ error: err?.message || "Beklenmeyen bir hata oluştu" }, { status: 500 })
  }
}

// POST /api/tables -> masa oluştur
// Body: { number: string, capacity: number, status?: 'musait' | 'dolu' | 'rezerve' | 'temizlik' }
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const number: string = body?.number
    const capacity: number = Number.parseInt(body?.capacity)
    const status: string | undefined = body?.status

    if (!number || !capacity) {
      return NextResponse.json({ error: "number ve capacity zorunludur" }, { status: 400 })
    }

    const id = crypto.randomUUID()

    // Oluştur (varsayılan status DB'de 'musait' olarak ayarlı)
    await dbQueries.createTable(id, number, capacity)

    // İstenirse oluşturduktan sonra status güncelle
    if (status) {
      await dbQueries.updateTableStatus(id, status)
    }

    // Oluşan kaydı dön
    const rows = await executeQuery<any>("SELECT * FROM restaurant_tables WHERE id = ?", [id])
    const table = rows?.[0] || { id, number, capacity, status: status ?? "musait" }
    return NextResponse.json(table, { status: 201 })
  } catch (err: any) {
    console.error("POST /api/tables error:", err)
    return NextResponse.json({ error: err?.message || "Beklenmeyen bir hata oluştu" }, { status: 500 })
  }
}
