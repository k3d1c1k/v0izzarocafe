"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, CheckCircle, ChefHat, Clock, Info } from "lucide-react"
import { type Order, OrderStatus, MenuCategory, UserRole } from "@/lib/types"
import { orderService } from "@/lib/services/order-service"
import { tableService } from "@/lib/services/table-service"
import { notificationService } from "@/lib/services/notification-service"

// Normalize role read from storage or objects
function normalizeRole(val: any): UserRole | null {
  if (val === null || val === undefined) return null
  if (typeof val === "number") return val as UserRole
  const s = String(val).trim().toLowerCase()
  if (s === "admin" || s === "yönetici" || s === "yonetici") return UserRole.ADMIN
  if (s === "manager" || s === "müdür" || s === "mudur") return UserRole.MANAGER
  if (s === "cashier" || s === "kasiyer") return UserRole.CASHIER
  if (s === "waiter" || s === "garson") return UserRole.WAITER
  if (s === "kitchen" || s === "mutfak" || s === "chef" || s === "aşçı" || s === "asci") return UserRole.KITCHEN
  const n = Number(s)
  if (!Number.isNaN(n)) return n as UserRole
  return null
}

export default function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([])
  const [userRole, setUserRole] = useState<UserRole | null>(null)

  useEffect(() => {
    loadOrders()
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [])

  // Read role from multiple storage keys and normalize
  useEffect(() => {
    try {
      const keys = ["currentUser", "user", "auth_user"]
      for (const k of keys) {
        const raw = typeof window !== "undefined" ? localStorage.getItem(k) : null
        if (raw) {
          const obj = JSON.parse(raw)
          const role = normalizeRole(obj?.role)
          if (role !== null) {
            setUserRole(role)
            return
          }
        }
      }
      const fallback = typeof window !== "undefined" ? localStorage.getItem("role") : null
      if (fallback !== null) {
        const role = normalizeRole(fallback)
        if (role !== null) setUserRole(role)
      }
    } catch {
      // ignore
    }
  }, [])

  const canManageAll = useMemo(() => userRole === UserRole.ADMIN || userRole === UserRole.KITCHEN, [userRole])
  const waiterCanComplete = userRole === UserRole.WAITER
  const isCashier = userRole === UserRole.CASHIER

  const loadOrders = async () => {
    const ordersData = await orderService.getAllOrders()
    // Kitchen-related items only
    let kitchenOrders = ordersData.filter(
      (order) =>
        order.status !== OrderStatus.COMPLETED &&
        order.items.some(
          (item) =>
            item.menuItem.category === MenuCategory.TATLILAR ||
            item.menuItem.category === MenuCategory.CLASSIC_COFFEE ||
            item.menuItem.category === MenuCategory.HOT_CHOCOLATE ||
            item.menuItem.category === MenuCategory.COFFEE_SPECIALS ||
            item.menuItem.category === MenuCategory.ICE_LATTE ||
            item.menuItem.category === MenuCategory.COFFEE_CHILLER,
        ),
    )
    // Waiter only sees ready orders to complete service
    if (waiterCanComplete) {
      kitchenOrders = kitchenOrders.filter((o) => o.status === "hazir")
    }
    setOrders(kitchenOrders)
  }

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" }
      if (userRole !== null) headers["x-user-role"] = String(userRole)

      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || `İşlem başarısız: ${res.status}`)
      }

      // When marked "hazir" notify waiter
      if (status === "hazir") {
        const order = orders.find((o) => o.id === orderId)
        if (order) {
          const table = await tableService.getTableById(order.tableId)
          if (table) await notificationService.createOrderReadyNotification(orderId, table.number)
        }
      }
      loadOrders()
    } catch (e: any) {
      alert(e?.message || "İşlem başarısız")
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "bekliyor":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hazirlaniyor":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "hazir":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "bekliyor":
        return "Bekliyor"
      case "hazirlaniyor":
        return "Hazırlanıyor"
      case "hazir":
        return "Hazır"
      default:
        return status
    }
  }

  const getElapsedTime = (createdAt: Date) => {
    const now = new Date()
    return Math.floor((now.getTime() - new Date(createdAt).getTime()) / 1000 / 60)
  }

  const getPriorityLevel = (elapsedTime: number) => {
    if (elapsedTime > 30) return "high"
    if (elapsedTime > 15) return "medium"
    return "low"
  }

  const NoPermission = () => (
    <Card>
      <CardContent className="text-center py-12">
        <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erişim Yok</h3>
        <p className="text-gray-600">Bu sayfa sadece Yönetici ve Mutfak içindir.</p>
      </CardContent>
    </Card>
  )

  if (isCashier) return <NoPermission />

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mutfak Ekran Sistemi</h2>
          <p className="text-gray-600">Yemek siparişlerini yönetin ve hazırlık durumunu takip edin</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            <ChefHat className="w-4 h-4 mr-1" />
            Aktif Siparişler: {orders.length}
          </Badge>
          <Badge variant="outline" className="text-sm">
            Son Güncelleme: {new Date().toLocaleTimeString("tr-TR")}
          </Badge>
        </div>
      </div>

      {!canManageAll && !waiterCanComplete && (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Info className="h-3 w-3" />
          Yalnızca Yönetici ve Mutfak işlem yapabilir. Garsonlar sadece servisi tamamlayabilir.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orders.map((order) => {
          const elapsedTime = getElapsedTime(order.createdAt)
          const priority = getPriorityLevel(elapsedTime)
          const foodItems = order.items.filter(
            (item) =>
              item.menuItem.category === MenuCategory.TATLILAR ||
              item.menuItem.category === MenuCategory.CLASSIC_COFFEE ||
              item.menuItem.category === MenuCategory.HOT_CHOCOLATE ||
              item.menuItem.category === MenuCategory.COFFEE_SPECIALS ||
              item.menuItem.category === MenuCategory.ICE_LATTE ||
              item.menuItem.category === MenuCategory.COFFEE_CHILLER,
          )

          const cardTone =
            priority === "high"
              ? "border-red-300 bg-red-50"
              : priority === "medium"
                ? "border-yellow-300 bg-yellow-50"
                : "border-gray-200"

          return (
            <Card key={order.id} className={cardTone}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Masa {order.tableId}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      {elapsedTime} dakika önce
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge className={getStatusColor(order.status)}>{getStatusText(order.status)}</Badge>
                    {priority === "high" && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        ACİL
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {foodItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded border">
                      <div>
                        <span className="font-medium">{item.menuItem.name}</span>
                        {item.notes && <p className="text-xs text-gray-600 mt-1">Not: {item.notes}</p>}
                      </div>
                      <Badge variant="secondary" className="ml-2">
                        x{item.quantity}
                      </Badge>
                    </div>
                  ))}
                </div>

                <TooltipProvider>
                  <div className="flex space-x-2 pt-2">
                    {order.status === "bekliyor" &&
                      (canManageAll ? (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "hazirlaniyor")}
                          className="flex-1"
                        >
                          <ChefHat className="w-3 h-3 mr-1" />
                          Pişirmeye Başla
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" className="flex-1" disabled aria-disabled>
                              <ChefHat className="w-3 h-3 mr-1" />
                              Pişirmeye Başla
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Yalnızca Yönetici ve Mutfak işlem yapabilir</TooltipContent>
                        </Tooltip>
                      ))}

                    {order.status === "hazirlaniyor" &&
                      (canManageAll ? (
                        <Button
                          size="sm"
                          onClick={() => updateOrderStatus(order.id, "hazir")}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Sipariş Hazır
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button size="sm" className="flex-1" disabled aria-disabled>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Sipariş Hazır
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Yalnızca Yönetici ve Mutfak işlem yapabilir</TooltipContent>
                        </Tooltip>
                      ))}

                    {order.status === "hazir" &&
                      (canManageAll || waiterCanComplete ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, "tamamlandi")}
                          className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Servis Edildi
                        </Button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-green-300 text-green-700 bg-transparent"
                              disabled
                              aria-disabled
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Servis Edildi
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Yalnızca Yönetici, Mutfak ya da Garson tamamlayabilir</TooltipContent>
                        </Tooltip>
                      ))}
                  </div>
                </TooltipProvider>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {orders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <ChefHat className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hepsi tamamlandı!</h3>
            <p className="text-gray-600">Mutfakta bekleyen sipariş yok.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
