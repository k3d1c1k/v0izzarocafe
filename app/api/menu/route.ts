import { NextRequest, NextResponse } from "next/server"
import { menuService } from "@/lib/services/menu-service"
import { type MenuCategory } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = (searchParams.get("category") || "") as MenuCategory | ""
    const search = searchParams.get("search") || ""
    const includeInactive = searchParams.get("includeInactive") === "true"

    let items
    if (category) {
      items = await menuService.getMenuItemsByCategory(category, { search, includeInactive })
    } else {
      items = await menuService.getAllMenuItems({ search, includeInactive })
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error("Error fetching menu items:", error)
    return NextResponse.json({ error: "Menü öğeleri yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, category, preparationTime, available } = body

    if (!name || typeof price !== "number" || !category) {
      return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 })
    }

    const created = await menuService.createMenuItem({
      name: String(name).trim(),
      description: String(description || "").trim(),
      price: Number(price),
      category,
      preparationTime: Number(preparationTime || 15),
      available: available !== false,
    })

    return NextResponse.json(created, { status: 201 })
  } catch (error) {
    console.error("Error creating menu item:", error)
    return NextResponse.json({ error: "Menü öğesi oluşturulurken hata oluştu" }, { status: 500 })
  }
}
