import type { Payment } from "@/lib/types"

// In-memory storage (replace with MySQL database in production)
const payments: Payment[] = []

export const paymentService = {
  async getAllPayments(): Promise<Payment[]> {
    return payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async getPaymentById(id: string): Promise<Payment | null> {
    return payments.find((payment) => payment.id === id) || null
  },

  async getPaymentsByTableId(tableId: string): Promise<Payment[]> {
    return payments.filter((payment) => payment.tableId === tableId)
  },

  async createPayment(paymentData: Omit<Payment, "id" | "createdAt">): Promise<Payment> {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    payments.push(newPayment)
    return newPayment
  },

  async updatePaymentStatus(id: string, status: "pending" | "completed" | "failed"): Promise<Payment | null> {
    const paymentIndex = payments.findIndex((payment) => payment.id === id)
    if (paymentIndex === -1) return null

    payments[paymentIndex] = {
      ...payments[paymentIndex],
      status,
    }
    return payments[paymentIndex]
  },

  async getTodaysPayments(): Promise<Payment[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return payments.filter((payment) => {
      const paymentDate = new Date(payment.createdAt)
      return paymentDate >= today && paymentDate < tomorrow && payment.status === "completed"
    })
  },

  async getTotalSalesForPeriod(startDate: Date, endDate: Date): Promise<number> {
    return payments
      .filter((payment) => {
        const paymentDate = new Date(payment.createdAt)
        return paymentDate >= startDate && paymentDate <= endDate && payment.status === "completed"
      })
      .reduce((total, payment) => total + payment.amount, 0)
  },
}
