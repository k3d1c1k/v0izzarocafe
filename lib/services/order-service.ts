import type { Order } from "@/lib/types"
import { tableService } from "./table-service"

// Update order status enum to Turkish
export enum OrderStatus {
  PENDING = "bekliyor",
  PREPARING = "hazirlaniyor",
  READY = "hazir",
  COMPLETED = "tamamlandi",
  CANCELLED = "iptal",
}

// In-memory storage (replace with MySQL database in production)
let orders: Order[] = []

export const orderService = {
  async getAllOrders(): Promise<Order[]> {
    return orders
  },

  async getOrderById(id: string): Promise<Order | null> {
    return orders.find((order) => order.id === id) || null
  },

  async getOrdersByTableId(tableId: string): Promise<Order[]> {
    return orders.filter((order) => order.tableId === tableId)
  },

  async createOrder(orderData: Omit<Order, "id">): Promise<Order> {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
    }
    orders.push(newOrder)

    // Update table with current order
    await tableService.updateTableOrder(orderData.tableId, newOrder)

    return newOrder
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
    const orderIndex = orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) return null

    const updatedOrder = {
      ...orders[orderIndex],
      status,
      updatedAt: new Date(),
      ...(status === OrderStatus.COMPLETED && { completedAt: new Date() }),
    }

    orders[orderIndex] = updatedOrder

    // Update table order status
    await tableService.updateTableOrder(updatedOrder.tableId, updatedOrder)

    return updatedOrder
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    const orderIndex = orders.findIndex((order) => order.id === id)
    if (orderIndex === -1) return null

    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updates,
      updatedAt: new Date(),
    }
    return orders[orderIndex]
  },

  async deleteOrder(id: string): Promise<boolean> {
    const initialLength = orders.length
    orders = orders.filter((order) => order.id !== id)
    return orders.length < initialLength
  },

  async getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    return orders.filter((order) => order.status === status)
  },

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt)
      return orderDate >= startDate && orderDate <= endDate
    })
  },
}
