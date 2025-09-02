"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users, Activity, Download, History, ArrowRightLeft } from 'lucide-react'
import { type ActivityLog, type User, ActivityType } from "@/lib/types"
import { activityService } from "@/lib/services/activity-service"

interface ReportsProps {
currentUser: User
}

type StatusKey = "bekliyor" | "hazirlaniyor" | "hazir" | "tamamlandi" | "iptal" | string

export default function Reports({ currentUser }: ReportsProps) {
const [activities, setActivities] = useState<ActivityLog[]>([])
const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  void loadReports()
  const interval = setInterval(() => void loadReports(), 10000)
  return () => clearInterval(interval)
}, [selectedDate])

async function loadReports() {
  setLoading(true)
  setError(null)
  try {
    const start = new Date(selectedDate)
    start.setHours(0, 0, 0, 0)
    const end = new Date(selectedDate)
    end.setHours(23, 59, 59, 999)
    const data = await activityService.getActivitiesForPeriod(start, end)
    setActivities(data)
  } catch (err: any) {
    console.error("Raporlar yüklenirken hata:", err)
    setError(err?.message || "Raporlar yüklenemedi")
  } finally {
    setLoading(false)
  }
}

const todaysActivities = activities

// Özet metrikleri activity'lerden çıkar
const { dailySales, dailyOrders, avgOrder } = useMemo(() => {
  const payments = activities.filter((a) => a.type === ActivityType.PAYMENT_RECEIVED)
  const totalSales = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const ordersCreated = activities.filter((a) => a.type === ActivityType.ORDER_CREATED).length
  const average = ordersCreated > 0 ? totalSales / ordersCreated : 0
  return { dailySales: totalSales, dailyOrders: ordersCreated, avgOrder: average }
}, [activities])

// Durum değişimleri: details.oldStatus ve details.newStatus olan activity'ler
const statusChanges = useMemo(() => {
  return activities
    .filter((a) => {
      // ORDER_UPDATED öncelikli; ama details içinde old/new varsa başka tiplerde de kabul
      const d = a.details || {}
      return Boolean(d.oldStatus && d.newStatus)
    })
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}, [activities])

// Durum geçiş özetleri
const statusSummary = useMemo(() => {
  const counters: Record<string, number> = {}
  for (const a of statusChanges) {
    const to = (a.details?.newStatus || "") as string
    counters[to] = (counters[to] || 0) + 1
  }
  return counters
}, [statusChanges])

function formatStatusLabel(s: StatusKey) {
  const map: Record<string, string> = {
    bekliyor: "Bekliyor",
    hazirlaniyor: "Hazırlanıyor",
    hazir: "Hazır",
    tamamlandi: "Tamamlandı",
    iptal: "İptal",
  }
  return map[s] || s
}

function statusColor(s: StatusKey) {
  const base = "border"
  switch (s) {
    case "bekliyor":
      return `${base} bg-gray-100 text-gray-800 border-gray-200`
    case "hazirlaniyor":
      return `${base} bg-amber-100 text-amber-800 border-amber-200`
    case "hazir":
      return `${base} bg-blue-100 text-blue-800 border-blue-200`
    case "tamamlandi":
      return `${base} bg-emerald-100 text-emerald-800 border-emerald-200`
    case "iptal":
      return `${base} bg-rose-100 text-rose-800 border-rose-200`
    default:
      return `${base} bg-slate-100 text-slate-800 border-slate-200`
  }
}

function getActivityTypeText(type: ActivityType) {
  switch (type) {
    case ActivityType.ORDER_CREATED:
      return "Sipariş Oluşturuldu"
    case ActivityType.PAYMENT_RECEIVED:
      return "Ödeme Alındı"
    case ActivityType.TABLE_CLEANED:
      return "Masa Temizlendi"
    case ActivityType.TABLE_STATUS_CHANGED:
      return "Masa Durumu Değişti"
    case ActivityType.ORDER_COMPLETED:
      return "Sipariş Tamamlandı"
    case ActivityType.ORDER_UPDATED:
      return "Sipariş Güncellendi"
    default:
      return String(type)
  }
}

function getActivityTypeColor(type: ActivityType) {
  switch (type) {
    case ActivityType.ORDER_CREATED:
      return "bg-blue-100 text-blue-800 border-blue-200"
    case ActivityType.PAYMENT_RECEIVED:
      return "bg-green-100 text-green-800 border-green-200"
    case ActivityType.TABLE_CLEANED:
      return "bg-purple-100 text-purple-800 border-purple-200"
    case ActivityType.TABLE_STATUS_CHANGED:
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case ActivityType.ORDER_COMPLETED:
      return "bg-emerald-100 text-emerald-800 border-emerald-200"
    case ActivityType.ORDER_UPDATED:
      return "bg-amber-100 text-amber-900 border-amber-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case ActivityType.ORDER_CREATED:
      return <ShoppingCart className="w-4 h-4" />
    case ActivityType.PAYMENT_RECEIVED:
      return <DollarSign className="w-4 h-4" />
    case ActivityType.TABLE_CLEANED:
      return <Users className="w-4 h-4" />
    case ActivityType.TABLE_STATUS_CHANGED:
      return <Activity className="w-4 h-4" />
    case ActivityType.ORDER_COMPLETED:
      return <TrendingUp className="w-4 h-4" />
    case ActivityType.ORDER_UPDATED:
      return <ArrowRightLeft className="w-4 h-4" />
    default:
      return <Activity className="w-4 h-4" />
  }
}

function downloadCSV(rows: ActivityLog[]) {
  const head = [
    "Tarih",
    "Saat",
    "Kullanıcı",
    "Masa",
    "Sipariş",
    "Eski Durum",
    "Yeni Durum",
    "Açıklama",
  ].join(",")

  const body = rows
    .map((a) => {
      const dt = new Date(a.createdAt)
      const date = dt.toLocaleDateString("tr-TR")
      const time = dt.toLocaleTimeString("tr-TR")
      const oldS = (a.details?.oldStatus ?? "") as string
      const newS = (a.details?.newStatus ?? "") as string
      const csvEscape = (v: string) => `"${String(v).replace(/"/g, '""')}"`
      return [
        csvEscape(date),
        csvEscape(time),
        csvEscape(a.userName || ""),
        csvEscape(a.tableNumber || ""),
        csvEscape(a.orderId || ""),
        csvEscape(formatStatusLabel(oldS)),
        csvEscape(formatStatusLabel(newS)),
        csvEscape(a.description || ""),
      ].join(",")
    })
    .join("\n")

  const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `durum-degisimleri_${selectedDate}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadActivitiesCSV() {
  const rows = todaysActivities || []
  if (!rows.length) return
  const csvEscape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
  const head = [
    "ID",
    "Tarih",
    "Saat",
    "Tür",
    "Açıklama",
    "Tutar"
  ].join(",")

  const body = rows
    .map((a) => {
      const dt = new Date(a.createdAt)
      const date = dt.toLocaleDateString("tr-TR")
      const time = dt.toLocaleTimeString("tr-TR")
      // a.type, a.description, a.amount alanlarını güvenli şekilde okuyalım
      const type = (typeof a.type === "string" ? a.type : (a as any).type) ?? ""
      const desc = (a as any).description ?? ""
      const amt = typeof (a as any).amount === "number" ? (a as any).amount.toFixed(2) : ""
      return [
        csvEscape((a as any).id ?? ""),
        csvEscape(date),
        csvEscape(time),
        csvEscape(type),
        csvEscape(desc),
        csvEscape(amt),
      ].join(",")
    })
    .join("\n")

  const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `rapor_${selectedDate}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Raporlar ve Analizler</h2>
        <p className="text-gray-600">İşletme performansını takip edin ve analiz edin</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Label htmlFor="date">Tarih:</Label>
          <Input
            id="date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button variant="outline" onClick={downloadActivitiesCSV} disabled={todaysActivities.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Rapor İndir
        </Button>
      </div>
    </div>

    {/* Summary Cards */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Günlük Satış</p>
              <p className="text-2xl font-bold text-green-600">₺{dailySales.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Günlük Sipariş</p>
              <p className="text-2xl font-bold text-blue-600">{dailyOrders}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Sipariş</p>
              <p className="text-2xl font-bold text-purple-600">₺{avgOrder.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Günlük İşlem</p>
              <p className="text-2xl font-bold text-orange-600">{todaysActivities.length}</p>
            </div>
            <Activity className="w-8 h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Detailed Reports */}
    <Tabs defaultValue="activities" className="space-y-4">
      <TabsList className="flex flex-wrap gap-2">
        <TabsTrigger value="activities">İşlem Geçmişi</TabsTrigger>
        <TabsTrigger value="sales">Satış Analizi</TabsTrigger>
        <TabsTrigger value="performance">Performans</TabsTrigger>
        <TabsTrigger value="status">Durum Değişimleri</TabsTrigger>
      </TabsList>

      {/* İşlem Geçmişi */}
      <TabsContent value="activities" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Günlük İşlem Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : loading ? (
              <p className="text-sm text-gray-500">Yükleniyor...</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todaysActivities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Seçili tarihte işlem bulunamadı.</p>
                ) : (
                  todaysActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge className={getActivityTypeColor(activity.type)}>
                            {getActivityTypeText(activity.type)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleTimeString("tr-TR")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{activity.description}</p>
                        {activity.amount && (
                          <p className="text-sm font-semibold text-green-600 mt-1">₺{activity.amount.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* Satış Analizi */}
      <TabsContent value="sales" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Satış Analizi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Ödeme Yöntemleri</h4>
                {/* Örnek: payments breakdown -> aktivitelerden türetilebilir, burada 0.00 placeholder */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Nakit:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kart:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dijital:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Saatlik Dağılım</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>09:00-12:00:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>12:00-15:00:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>15:00-18:00:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>18:00-22:00:</span>
                    <span className="font-semibold">₺0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Performans */}
      <TabsContent value="performance" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Personel Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {activities.filter((a) => a.type === ActivityType.ORDER_CREATED).length}
                  </div>
                  <div className="text-sm text-gray-600">Toplam Sipariş</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {activities.filter((a) => a.type === ActivityType.PAYMENT_RECEIVED).length}
                  </div>
                  <div className="text-sm text-gray-600">Ödeme İşlemi</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {activities.filter((a) => a.type === ActivityType.TABLE_CLEANED).length}
                  </div>
                  <div className="text-sm text-gray-600">Masa Temizliği</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Durum Değişimleri */}
      <TabsContent value="status" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="w-5 h-5 mr-2" />
              Sipariş Durum Değişimleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Özet */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {Object.entries(statusSummary).length === 0 ? (
                <div className="col-span-2 md:col-span-5 text-sm text-gray-500">
                  Seçili tarihte durum değişimi bulunamadı.
                </div>
              ) : (
                Object.entries(statusSummary).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between rounded-md border p-3">
                    <span className="text-sm text-gray-600">{formatStatusLabel(status as StatusKey)}</span>
                    <span className="text-lg font-semibold">{count}</span>
                  </div>
                ))
              )}
            </div>

            {/* Liste */}
            <div className="space-y-3 max-h-[28rem] overflow-y-auto">
              {statusChanges.map((a) => {
                const oldS = (a.details?.oldStatus || "") as StatusKey
                const newS = (a.details?.newStatus || "") as StatusKey
                return (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="mt-1">
                      <ArrowRightLeft className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge className={statusColor(oldS)}>{formatStatusLabel(oldS)}</Badge>
                        <span className="text-xs text-gray-500">→</span>
                        <Badge className={statusColor(newS)}>{formatStatusLabel(newS)}</Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(a.createdAt).toLocaleTimeString("tr-TR")}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                        {a.tableNumber && (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-gray-500">Masa:</span>
                            <span className="font-medium">{a.tableNumber}</span>
                          </span>
                        )}
                        {a.orderId && (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-gray-500">Sipariş:</span>
                            <span className="font-medium">{a.orderId}</span>
                          </span>
                        )}
                        {a.userName && (
                          <span className="inline-flex items-center gap-1">
                            <span className="text-gray-500">Kullanıcı:</span>
                            <span className="font-medium">{a.userName}</span>
                          </span>
                        )}
                      </div>
                      {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
)
}
