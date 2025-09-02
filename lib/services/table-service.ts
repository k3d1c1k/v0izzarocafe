import type { Table } from "@/lib/types"

// Not: TableStatus türünü UI bileşenleriniz "@/lib/types" içinden kullanıyor.
// Bu servis istemci tarafta /api/tables endpoint'lerini çağırır.

// Yardımcı: JSON parse hatalarını daha anlamlı yapalım
async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error(text || "Sunucudan beklenmeyen yanıt")
  }
}

export const tableService = {
  async getAllTables(): Promise<Table[]> {
    const res = await fetch("/api/tables", { cache: "no-store" })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || "Masalar alınamadı")
    }
    return parseJson<Table[]>(res)
  },

  async getTableById(id: string): Promise<Table | null> {
    const res = await fetch(`/api/tables/${id}`, { cache: "no-store" })
    if (res.status === 404) return null
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || "Masa alınamadı")
    }
    return parseJson<Table>(res)
  },

  async createTable(tableData: { number: string; capacity: number; status?: "musait" | "dolu" | "rezerve" | "temizlik" }) {
    const res = await fetch("/api/tables", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tableData),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || "Masa oluşturulamadı")
    }
    return parseJson<Table>(res)
  },

  async updateTableStatus(id: string, status: "musait" | "dolu" | "rezerve" | "temizlik") {
    const res = await fetch(`/api/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || "Masa durumu güncellenemedi")
    }
    return parseJson<Table>(res)
  },

  async updateTable(id: string, data: Partial<{ number: string; capacity: number; status: "musait" | "dolu" | "rezerve" | "temizlik" }>) {
    const res = await fetch(`/api/tables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || "Masa güncellenemedi")
    }
    return parseJson<Table>(res)
  },

  async deleteTable(id: string) {
    const res = await fetch(`/api/tables/${id}`, { method: "DELETE" })
    if (!res.ok && res.status !== 204) {
      const err = await res.text()
      throw new Error(err || "Masa silinemedi")
    }
    return true
  },

  // Eski API uyumluluğu için placeholder (DB şemasında currentOrder alanı yok)
  async updateTableOrder(_id: string, _order: any) {
    return null
  },
}
