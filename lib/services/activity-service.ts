import { type ActivityLog, ActivityType } from "@/lib/types"

async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const err = (await res.json()) as any
      if (err?.error) message = err.error
      if (err?.details) message += ` - ${err.details}`
    } catch {
      // ignore
    }
    throw new Error(message)
  }
  return (await res.json()) as T
}

export const activityService = {
  async getAllActivities(): Promise<ActivityLog[]> {
    const data = await getJSON<ActivityLog[]>("/api/activities")
    return data.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }) as ActivityLog)
  },

  async getTodaysActivities(): Promise<ActivityLog[]> {
    const data = await getJSON<ActivityLog[]>("/api/activities?today=1")
    return data.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }) as ActivityLog)
  },

  async getActivitiesByType(type: ActivityType): Promise<ActivityLog[]> {
    const data = await getJSON<ActivityLog[]>(`/api/activities?type=${encodeURIComponent(String(type))}`)
    return data.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }) as ActivityLog)
  },

  async getActivitiesByUser(userId: string): Promise<ActivityLog[]> {
    const data = await getJSON<ActivityLog[]>(`/api/activities?userId=${encodeURIComponent(userId)}`)
    return data.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }) as ActivityLog)
  },

  async getActivitiesByTable(tableId: string): Promise<ActivityLog[]> {
    const data = await getJSON<ActivityLog[]>(`/api/activities?tableId=${encodeURIComponent(tableId)}`)
    return data.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }) as ActivityLog)
  },

  async getActivitiesForPeriod(startDate: Date, endDate: Date): Promise<ActivityLog[]> {
    const qs = new URLSearchParams({
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    })
    const data = await getJSON<ActivityLog[]>(`/api/activities?${qs.toString()}`)
    return data.map((a: any) => ({ ...a, createdAt: new Date(a.createdAt) }) as ActivityLog)
  },

  async createActivity(activityData: Omit<ActivityLog, "id" | "createdAt">): Promise<ActivityLog> {
    const res = await getJSON<ActivityLog>("/api/activities", {
      method: "POST",
      body: JSON.stringify(activityData),
    })
    return { ...res, createdAt: new Date(res.createdAt) }
  },

  // Helper'lar (mevcut isimler korunur)
  async logOrderCreated(
    userId: string,
    userName: string,
    orderId: string,
    tableId: string,
    tableNumber: string,
    amount: number,
  ): Promise<void> {
    await this.createActivity({
      type: ActivityType.ORDER_CREATED,
      description: `${userName} tarafından Masa ${tableNumber} için ${amount.toFixed(2)}₺ tutarında sipariş oluşturuldu`,
      userId,
      userName,
      tableId,
      tableNumber,
      orderId,
      amount,
    })
  },

  async logPaymentReceived(
    userId: string,
    userName: string,
    orderId: string,
    tableId: string,
    tableNumber: string,
    amount: number,
    method: string,
  ): Promise<void> {
    await this.createActivity({
      type: ActivityType.PAYMENT_RECEIVED,
      description: `${userName} tarafından Masa ${tableNumber} için ${amount.toFixed(2)}₺ ödeme alındı (${method})`,
      userId,
      userName,
      tableId,
      tableNumber,
      orderId,
      amount,
      details: { paymentMethod: method },
    })
  },

  async logTableCleaned(userId: string, userName: string, tableId: string, tableNumber: string): Promise<void> {
    await this.createActivity({
      type: ActivityType.TABLE_CLEANED,
      description: `${userName} tarafından Masa ${tableNumber} temizlendi`,
      userId,
      userName,
      tableId,
      tableNumber,
    })
  },

  async logTableStatusChanged(
    userId: string,
    userName: string,
    tableId: string,
    tableNumber: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    await this.createActivity({
      type: ActivityType.TABLE_STATUS_CHANGED,
      description: `${userName} tarafından Masa ${tableNumber} durumu ${oldStatus} → ${newStatus} olarak değiştirildi`,
      userId,
      userName,
      tableId,
      tableNumber,
      details: { oldStatus, newStatus },
    })
  },

  async logOrderCompleted(
    userId: string,
    userName: string,
    orderId: string,
    tableId: string,
    tableNumber: string,
  ): Promise<void> {
    await this.createActivity({
      type: ActivityType.ORDER_COMPLETED,
      description: `${userName} tarafından Masa ${tableNumber} siparişi tamamlandı`,
      userId,
      userName,
      tableId,
      tableNumber,
      orderId,
    })
  },
}
