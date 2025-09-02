"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Minus, ShoppingCart, Clock, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  type Table,
  type MenuItem,
  type Order,
  type OrderItem,
  OrderStatus,
  type User,
  MenuCategory,
} from "@/lib/types"
import { tableService } from "@/lib/services/table-service"
import { orderService } from "@/lib/services/order-service"
import { menuServiceClient } from "@/lib/services/menu-service-client"

interface OrderManagementProps {
  currentUser: User
}

export default function OrderManagement({ currentUser }: OrderManagementProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([])
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(MenuCategory.TATLILAR)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadTables()
    loadMenu()
  }, [])

  const loadTables = async () => {
    const tablesData = await tableService.getAllTables()
    setTables(tablesData)
  }

  const loadMenu = async () => {
    const menuData = await menuServiceClient.getAllMenuItems()
    setMenuItems(menuData)
  }

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table)
    setSearchTerm("") // Add this line
    if (table.currentOrder) {
      setCurrentOrder(table.currentOrder.items)
    } else {
      setCurrentOrder([])
    }
  }

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = currentOrder.find((item) => item.menuItemId === menuItem.id)

    if (existingItem) {
      setCurrentOrder(
        currentOrder.map((item) => (item.menuItemId === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item)),
      )
    } else {
      setCurrentOrder([
        ...currentOrder,
        {
          id: Date.now().toString(),
          menuItemId: menuItem.id,
          menuItem,
          quantity: 1,
          price: menuItem.price,
          notes: "",
        },
      ])
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCurrentOrder(currentOrder.filter((item) => item.id !== itemId))
    } else {
      setCurrentOrder(currentOrder.map((item) => (item.id === itemId ? { ...item, quantity } : item)))
    }
  }

  const calculateTotal = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const handlePlaceOrder = async () => {
    if (!selectedTable || currentOrder.length === 0) return

    const order: Omit<Order, "id"> = {
      tableId: selectedTable.id,
      items: currentOrder,
      status: OrderStatus.PENDING,
      total: calculateTotal(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await orderService.createOrder(order)
    setIsOrderDialogOpen(false)
    setCurrentOrder([])
    loadTables()
  }

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory = item.category === selectedCategory
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch && item.available
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sipariş Yönetimi</h2>
          <p className="text-gray-600">Sipariş alın ve masa servisini yönetin</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tables List */}
        <Card>
          <CardHeader>
            <CardTitle>Masa Seçin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tables.map((table) => (
              <Button
                key={table.id}
                variant={selectedTable?.id === table.id ? "default" : "outline"}
                className="w-full justify-between"
                onClick={() => handleTableSelect(table)}
              >
                <span>Table {table.number}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{table.status}</Badge>
                  {table.currentOrder && <Badge variant="outline">₺{table.currentOrder.total.toFixed(2)}</Badge>}
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Current Order */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Mevcut Sipariş</CardTitle>
              {selectedTable && (
                <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Ürün Ekle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto overflow-x-hidden">
                    <DialogHeader>
                      <DialogTitle>{`Sipariş Ekle - Masa ${selectedTable.number}`}</DialogTitle>
                    </DialogHeader>

                    <Tabs
                      value={selectedCategory}
                      onValueChange={(value) => setSelectedCategory(value as MenuCategory)}
                    >
                      {/* Sticky search + tabs header */}
                      <div className="sticky top-0 z-10 bg-white pb-3">
                        {/* Search */}
                        <div className="mb-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              placeholder="Ürün ara..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        {/* Horizontally scrollable tabs on mobile, grid on md+ */}
                        <div className="-mx-4 px-4 md:mx-0 md:px-0">
                          <div className="relative">
                            <div className="no-scrollbar overflow-x-auto md:overflow-visible">
                              <TabsList
                                className="flex w-full items-center gap-2 whitespace-nowrap rounded-md bg-gray-100 p-1 md:grid md:grid-cols-5 snap-x snap-mandatory"
                                aria-label="Menü kategorileri"
                              >
                                <TabsTrigger
                                  value={MenuCategory.TATLILAR}
                                  className="shrink-0 snap-start rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                                >
                                  Tatlılar
                                </TabsTrigger>
                                <TabsTrigger
                                  value={MenuCategory.CLASSIC_COFFEE}
                                  className="shrink-0 snap-start rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                                >
                                  Classic Coffee
                                </TabsTrigger>
                                <TabsTrigger
                                  value={MenuCategory.HOT_CHOCOLATE}
                                  className="shrink-0 snap-start rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                                >
                                  Hot Chocolate
                                </TabsTrigger>
                                <TabsTrigger
                                  value={MenuCategory.COFFEE_SPECIALS}
                                  className="shrink-0 snap-start rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                                >
                                  Coffee Specials
                                </TabsTrigger>
                                <TabsTrigger
                                  value={MenuCategory.RUM_KONYAK_GIN}
                                  className="shrink-0 snap-start rounded-md px-3 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow"
                                >
                                  Rum/Konyak Gin
                                </TabsTrigger>
                              </TabsList>
                            </div>

                            {/* Edge fade hints for horizontal scroll (mobile only) */}
                            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-white to-transparent md:hidden" />
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white to-transparent md:hidden" />
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      <TabsContent value={selectedCategory} className="mt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {filteredMenuItems.map((item) => (
                            <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="mb-2 flex items-start justify-between">
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <span className="font-bold text-green-600">{`₺${item.price.toFixed(2)}`}</span>
                                </div>
                                <p className="mb-3 text-sm text-gray-600">{item.description}</p>
                                <Button size="sm" onClick={() => addToOrder(item)} className="w-full">
                                  {"Siparişe Ekle"}
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedTable ? (
              <p className="text-gray-500 text-center py-8">Sipariş görüntülemek/oluşturmak için bir masa seçin</p>
            ) : currentOrder.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Mevcut siparişte ürün yok</p>
            ) : (
              <div className="space-y-3">
                {currentOrder.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.menuItem.name}</h4>
                      <p className="text-sm text-gray-600">₺{item.price.toFixed(2)} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="ml-4 font-semibold">₺{(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}

                <div className="border-t pt-3 mt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Toplam:</span>
                    <span>₺{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={handlePlaceOrder} disabled={currentOrder.length === 0}>
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Sipariş Ver
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader>
            <CardTitle>Son Siparişler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tables
                .filter((table) => table.currentOrder)
                .map((table) => (
                  <div key={table.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">Table {table.number}</span>
                      <Badge variant="outline">{table.currentOrder?.status}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {table.currentOrder && new Date(table.currentOrder.createdAt).toLocaleTimeString()}
                      </div>
                      <span className="font-semibold">₺{table.currentOrder?.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
