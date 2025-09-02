"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TableManagement from "@/components/table-management"
import OrderManagement from "@/components/order-management"
import KitchenDisplay from "@/components/kitchen-display"
import AdminPanel from "@/components/admin-panel"
import Notifications from "@/components/notifications"
import CashierPanel from "@/components/cashier-panel"
import Reports from "@/components/reports"
import LoginPanel from "@/components/login-panel"
import MenuManagement from "@/components/menu-management"
import { type User, UserRole } from "@/lib/types"
import { notificationService } from "@/lib/services/notification-service"

// Convert any input role (string/translated/numeric) to the UserRole enum
function normalizeRole(val: unknown): UserRole | null {
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

function roleLabel(role: UserRole) {
  switch (role) {
    case UserRole.ADMIN:
      return "Yönetici"
    case UserRole.MANAGER:
      return "Müdür"
    case UserRole.CASHIER:
      return "Kasiyer"
    case UserRole.WAITER:
      return "Garson"
    case UserRole.KITCHEN:
      return "Mutfak"
    default:
      return String(role)
  }
}

export default function RestaurantPOS() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("tables")
  const [mounted, setMounted] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  // SSR/Hydration guard
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load user from localStorage and normalize role
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("currentUser") : null
      if (raw) {
        const parsed = JSON.parse(raw) as User
        const nr = normalizeRole((parsed as any).role)
        const fixed: User = nr !== null ? ({ ...parsed, role: nr } as User) : parsed
        setCurrentUser(fixed)
        // Write back normalized version so all code paths see the enum
        localStorage.setItem("currentUser", JSON.stringify(fixed))
        if (nr !== null) localStorage.setItem("role", String(nr))
      }
    } catch {
      // ignore
    }
  }, [])

  // When LoginPanel returns a user, normalize role and persist
  const handleLogin = (user: User) => {
    const nr = normalizeRole((user as any).role)
    const fixed: User = nr !== null ? ({ ...user, role: nr } as User) : user
    setCurrentUser(fixed)
    try {
      localStorage.setItem("currentUser", JSON.stringify(fixed))
      if (nr !== null) localStorage.setItem("role", String(nr))
    } catch {
      // ignore
    }
  }

  // Default tab per role when user changes (after normalization)
  useEffect(() => {
    const nr = normalizeRole(currentUser?.role)
    if (!currentUser || nr === null) return
    if (nr === UserRole.KITCHEN) setActiveTab("kitchen")
    else if (nr === UserRole.CASHIER) setActiveTab("cashier")
    else setActiveTab("tables")

    // ensure storage stays normalized
    try {
      localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, role: nr }))
      localStorage.setItem("role", String(nr))
    } catch {
      // ignore
    }
  }, [currentUser])

  // Waiter notification polling
  useEffect(() => {
    const nr = normalizeRole(currentUser?.role)
    if (!currentUser || nr !== UserRole.WAITER) return
    const load = async () => {
      const unread = await notificationService.getUnreadNotificationsByRole(UserRole.WAITER)
      setUnreadNotifications(unread.length)
    }
    load()
    const id = setInterval(load, 5000)
    return () => clearInterval(id)
  }, [currentUser])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-400" />
      </div>
    )
  }

  if (!currentUser) {
    return <LoginPanel onLogin={handleLogin} />
  }

  const nr = normalizeRole(currentUser.role) ?? currentUser.role

  // Kitchen staff must see ONLY the kitchen screen (no tabs at all)
  if (nr === UserRole.KITCHEN) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900">IZZARO COFFEE POS Sistemi</h1>
                <Badge variant="secondary">{roleLabel(UserRole.KITCHEN)}</Badge>
              </div>
              <div className="flex items-center space-x-4">
                <img src="/images/izzaro-logo.png" alt="Izzaro Coffee Bar" className="h-10 w-auto opacity-90" />
                <span className="text-sm text-gray-600">Hoş geldiniz, {currentUser.name}</span>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentUser(null)
                    try {
                      localStorage.removeItem("currentUser")
                      localStorage.removeItem("role")
                    } catch {}
                  }}
                >
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <KitchenDisplay />
        </main>
      </div>
    )
  }

  // For all other roles, show the tabbed interface
  const showKitchenTab = nr === UserRole.ADMIN || nr === UserRole.WAITER

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">IZZARO COFFEE POS Sistemi</h1>
              <Badge variant="secondary">{roleLabel(nr as UserRole)}</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <img
                src="/images/izzaro-logo.png"
                alt="Izzaro Coffee Bar"
                className="h-10 w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
              <span className="text-sm text-gray-600">Hoş geldiniz, {currentUser.name}</span>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentUser(null)
                  try {
                    localStorage.removeItem("currentUser")
                    localStorage.removeItem("role")
                  } catch {}
                }}
              >
                Çıkış Yap
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="tables">Masalar</TabsTrigger>
            <TabsTrigger value="orders">Siparişler</TabsTrigger>
            {showKitchenTab && <TabsTrigger value="kitchen">Mutfak</TabsTrigger>}
            {nr === UserRole.CASHIER && <TabsTrigger value="cashier">Kasa</TabsTrigger>}
            {nr === UserRole.WAITER && (
              <TabsTrigger value="notifications" className="relative">
                Bildirimler
                {unreadNotifications > 0 && (
                  <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
                    {unreadNotifications}
                  </Badge>
                )}
              </TabsTrigger>
            )}
            {(nr === UserRole.MANAGER || nr === UserRole.ADMIN) && <TabsTrigger value="menu">Menü</TabsTrigger>}
            {(nr === UserRole.MANAGER || nr === UserRole.ADMIN) && <TabsTrigger value="reports">Raporlar</TabsTrigger>}
            {nr === UserRole.ADMIN && <TabsTrigger value="admin">Yönetim</TabsTrigger>}
          </TabsList>

          <TabsContent value="tables" className="space-y-6">
            <TableManagement currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <OrderManagement currentUser={currentUser} />
          </TabsContent>

          {showKitchenTab && (
            <TabsContent value="kitchen" className="space-y-6">
              <KitchenDisplay />
            </TabsContent>
          )}

          {nr === UserRole.CASHIER && (
            <TabsContent value="cashier" className="space-y-6">
              <CashierPanel currentUser={currentUser} />
            </TabsContent>
          )}

          {nr === UserRole.WAITER && (
            <TabsContent value="notifications" className="space-y-6">
              <Notifications currentUser={currentUser} />
            </TabsContent>
          )}

          {(nr === UserRole.MANAGER || nr === UserRole.ADMIN) && (
            <TabsContent value="menu" className="space-y-6">
              <MenuManagement currentUser={currentUser} />
            </TabsContent>
          )}

          {(nr === UserRole.MANAGER || nr === UserRole.ADMIN) && (
            <TabsContent value="reports" className="space-y-6">
              <Reports currentUser={currentUser} />
            </TabsContent>
          )}

          {nr === UserRole.ADMIN && (
            <TabsContent value="admin" className="space-y-6">
              <AdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  )
}
