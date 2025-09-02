import { type MenuItem, type MenuCategory } from "@/lib/types"

type CreatePayload = {
  name: string
  description?: string
  price: number
  category: MenuCategory
  preparationTime?: number
  available?: boolean
}

type UpdatePayload = Partial<CreatePayload>

function qs(params: Record<string, string | number | boolean | undefined>) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== ""
  )
  const s = new URLSearchParams(entries as any).toString()
  return s ? `?${s}` : ""
}

export const menuServiceClient = {
  async getAllMenuItems(opts?: { includeInactive?: boolean; search?: string }) {
    const res = await fetch(`/api/menu${qs(opts || {})}`, { cache: "no-store" })
    if (!res.ok) throw new Error("Menü öğeleri getirilemedi")
    return (await res.json()) as MenuItem[]
  },

  async getAllMenuItemsIncludingInactive() {
    return this.getAllMenuItems({ includeInactive: true })
  },

  async getMenuItemsByCategory(category: MenuCategory, search?: string) {
    const res = await fetch(
      `/api/menu${qs({ category, search })}`,
      { cache: "no-store" }
    )
    if (!res.ok) throw new Error("Menü öğeleri getirilemedi")
    return (await res.json()) as MenuItem[]
  },

  async getMenuItemById(id: string) {
    const res = await fetch(`/api/menu/${id}`, { cache: "no-store" })
    if (!res.ok) throw new Error("Menü öğesi getirilemedi")
    return (await res.json()) as MenuItem
  },

  async createMenuItem(payload: CreatePayload) {
    const res = await fetch(`/api/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Menü öğesi oluşturulamadı")
    return (await res.json()) as MenuItem
  },

  async updateMenuItem(id: string, payload: UpdatePayload) {
    const res = await fetch(`/api/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error("Menü öğesi güncellenemedi")
    return (await res.json()) as MenuItem
  },

  async deleteMenuItem(id: string) {
    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Menü öğesi silinemedi")
    return true
  },
}
