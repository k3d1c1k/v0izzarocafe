import { NextRequest, NextResponse } from "next/server"
import { menuService } from "@/lib/services/menu-service"

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const item = await menuService.getMenuItemById(id)
    if (!item) {
      return NextResponse.json({ error: "Öğe bulunamadı" }, { status: 404 })
    }
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error fetching menu item:", error)
    return NextResponse.json({ error: "Menü öğesi yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const updated = await menuService.updateMenuItem(id, body)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating menu item:", error)
    return NextResponse.json({ error: "Menü öğesi güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await menuService.deleteMenuItem(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    return NextResponse.json({ error: "Menü öğesi silinirken hata oluştu" }, { status: 500 })
  }
}
