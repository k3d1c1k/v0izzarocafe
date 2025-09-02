import { type Notification, NotificationType, UserRole } from "@/lib/types"

// In-memory storage (replace with MySQL database in production)
let notifications: Notification[] = []

export const notificationService = {
  async getAllNotifications(): Promise<Notification[]> {
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getNotificationsByRole(role: UserRole): Promise<Notification[]> {
    return notifications
      .filter((notification) => notification.targetRoles.includes(role))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getUnreadNotificationsByRole(role: UserRole): Promise<Notification[]> {
    return notifications
      .filter((notification) => notification.targetRoles.includes(role) && !notification.isRead)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async createNotification(notificationData: Omit<Notification, "id" | "createdAt">): Promise<Notification> {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    notifications.push(newNotification)
    return newNotification
  },

  async markAsRead(id: string): Promise<boolean> {
    const notificationIndex = notifications.findIndex((notification) => notification.id === id)
    if (notificationIndex === -1) return false

    notifications[notificationIndex] = {
      ...notifications[notificationIndex],
      isRead: true,
    }
    return true
  },

  async markAllAsRead(role: UserRole): Promise<boolean> {
    notifications = notifications.map((notification) => {
      if (notification.targetRoles.includes(role)) {
        return { ...notification, isRead: true }
      }
      return notification
    })
    return true
  },

  async deleteNotification(id: string): Promise<boolean> {
    const initialLength = notifications.length
    notifications = notifications.filter((notification) => notification.id !== id)
    return notifications.length < initialLength
  },

  async createOrderReadyNotification(orderId: string, tableNumber: string): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.ORDER_READY,
      title: "Sipariş Hazır!",
      message: `Masa ${tableNumber} siparişi hazır ve servis bekliyor`,
      orderId,
      tableNumber,
      isRead: false,
      targetRoles: [UserRole.WAITER],
    })
  },

  async createTableCleaningNotification(tableId: string, tableNumber: string): Promise<Notification> {
    return this.createNotification({
      type: NotificationType.TABLE_CLEANING,
      title: "Masa Temizlik Gerekiyor!",
      message: `Masa ${tableNumber} ödeme alındı ve temizlik bekliyor`,
      tableId,
      tableNumber,
      isRead: false,
      targetRoles: [UserRole.WAITER],
    })
  },
}
