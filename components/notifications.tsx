"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Check, CheckCheck, Clock, Trash2 } from "lucide-react"
import type { Notification, User } from "@/lib/types"
import { notificationService } from "@/lib/services/notification-service"

interface NotificationsProps {
  currentUser: User
}

export default function Notifications({ currentUser }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadNotifications()
    // Set up polling for real-time updates
    const interval = setInterval(loadNotifications, 3000)
    return () => clearInterval(interval)
  }, [currentUser.role])

  const loadNotifications = async () => {
    try {
      const notificationsData = await notificationService.getNotificationsByRole(currentUser.role)
      const unreadData = await notificationService.getUnreadNotificationsByRole(currentUser.role)
      setNotifications(notificationsData)
      setUnreadCount(unreadData.length)
    } catch (error) {
      console.error("Bildirimler yüklenirken hata:", error)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      loadNotifications()
    } catch (error) {
      console.error("Bildirim okundu olarak işaretlenirken hata:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(currentUser.role)
      loadNotifications()
    } catch (error) {
      console.error("Tüm bildirimler okundu olarak işaretlenirken hata:", error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      loadNotifications()
    } catch (error) {
      console.error("Bildirim silinirken hata:", error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_ready":
        return <Bell className="w-5 h-5 text-green-600" />
      default:
        return <Bell className="w-5 h-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return "bg-gray-50 border-gray-200"

    switch (type) {
      case "order_ready":
        return "bg-green-50 border-green-200"
      default:
        return "bg-blue-50 border-blue-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bildirimler</h2>
          <p className="text-gray-600">Sistem bildirimleri ve uyarılar</p>
        </div>

        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            {unreadCount > 0 ? `${unreadCount} Okunmamış` : "Tüm bildirimler okundu"}
          </Badge>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Tümünü Okundu İşaretle
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Bildirim Yok</h3>
              <p className="text-gray-600">Henüz hiç bildiriminiz bulunmuyor.</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all hover:shadow-md ${getNotificationColor(notification.type, notification.isRead)}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                        {!notification.isRead && (
                          <Badge variant="destructive" className="text-xs px-2 py-0">
                            Yeni
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-700 mb-2">{notification.message}</p>

                      {notification.tableNumber && (
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(notification.createdAt).toLocaleTimeString("tr-TR")}
                          </span>
                          <span>Masa: {notification.tableNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.isRead && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      {notifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Bildirim İstatistikleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
                <div className="text-sm text-gray-600">Toplam Bildirim</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">Okunmamış</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</div>
                <div className="text-sm text-gray-600">Okunmuş</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {notifications.filter((n) => n.type === "order_ready").length}
                </div>
                <div className="text-sm text-gray-600">Sipariş Hazır</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
