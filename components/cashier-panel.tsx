"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CreditCard, DollarSign, Clock, CheckCircle, Receipt, Calculator } from "lucide-react"
import { type Table, type User, PaymentMethod, type TableStatus } from "@/lib/types"
import { tableService } from "@/lib/services/table-service"
import { orderService } from "@/lib/services/order-service"
import { paymentService } from "@/lib/services/payment-service"
import { notificationService } from "@/lib/services/notification-service"
import { activityService } from "@/lib/services/activity-service"

interface CashierPanelProps {
  currentUser: User
}

export default function CashierPanel({ currentUser }: CashierPanelProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [cashReceived, setCashReceived] = useState("")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    loadTables()
    const interval = setInterval(loadTables, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadTables = async () => {
    const tablesData = await tableService.getAllTables()
    // Show only occupied tables with orders for cashier
    const occupiedTables = tablesData.filter((table) => table.status === "dolu" && table.currentOrder)
    setTables(occupiedTables)
  }

  const calculateChange = () => {
    if (!selectedTable?.currentOrder || !cashReceived) return 0
    const received = Number.parseFloat(cashReceived) || 0
    const total = selectedTable.currentOrder.total
    return Math.max(0, received - total)
  }

  const isPaymentValid = () => {
    if (paymentMethod !== PaymentMethod.CASH) return true
    if (!cashReceived || !selectedTable?.currentOrder) return false
    const received = Number.parseFloat(cashReceived) || 0
    return received >= selectedTable.currentOrder.total
  }

  const handlePaymentReceived = async () => {
    if (!selectedTable || !selectedTable.currentOrder) return

    setError("")
    setSuccess("")

    if (!isPaymentValid()) {
      setError("Ödeme tutarı yetersiz!")
      return
    }

    try {
      // Create payment record
      await paymentService.createPayment({
        orderId: selectedTable.currentOrder.id,
        tableId: selectedTable.id,
        amount: selectedTable.currentOrder.total,
        method: paymentMethod,
        status: "completed",
        processedBy: currentUser.id,
      })

      // Complete the order
      await orderService.updateOrderStatus(selectedTable.currentOrder.id, "tamamlandi")

      // Change table status to cleaning
      await tableService.updateTableStatus(selectedTable.id, "temizlik")

      // Clear current order from table
      await tableService.updateTableOrder(selectedTable.id, undefined)

      // Create cleaning notification for waiters
      await notificationService.createTableCleaningNotification(selectedTable.id, selectedTable.number)

      // Log the payment activity
      await activityService.logPaymentReceived(
        currentUser.id,
        currentUser.name,
        selectedTable.currentOrder.id,
        selectedTable.id,
        selectedTable.number,
        selectedTable.currentOrder.total,
        getPaymentMethodText(paymentMethod),
      )

      const changeAmount = calculateChange()
      let successMessage = `Masa ${selectedTable.number} için ödeme başarıyla alındı!`
      if (paymentMethod === PaymentMethod.CASH && changeAmount > 0) {
        successMessage += ` Para üstü: ₺${changeAmount.toFixed(2)}`
      }

      setSuccess(successMessage)
      setIsPaymentDialogOpen(false)
      setSelectedTable(null)
      setCashReceived("")
      loadTables()
    } catch (err) {
      setError("Ödeme işlemi sırasında hata oluştu!")
    }
  }

  const getPaymentMethodText = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return "Nakit"
      case PaymentMethod.CARD:
        return "Kart"
      case PaymentMethod.DIGITAL:
        return "Dijital"
      default:
        return method
    }
  }

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "dolu":
        return "bg-red-100 text-red-800 border-red-200"
      case "temizlik":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kasiyer Paneli</h2>
          <p className="text-gray-600">Ödemeleri alın ve faturaları yönetin</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-sm">
            <CreditCard className="w-4 h-4 mr-1" />
            Ödeme Bekleyen: {tables.length}
          </Badge>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Tables with Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tables.map((table) => (
          <Card key={table.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Masa {table.number}</CardTitle>
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {table.currentOrder && new Date(table.currentOrder.createdAt).toLocaleTimeString("tr-TR")}
                  </div>
                </div>
                <Badge className={getStatusColor(table.status)}>{table.status === "dolu" ? "Dolu" : "Temizlik"}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {table.currentOrder && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sipariş Tutarı:</span>
                      <span className="font-semibold">₺{table.currentOrder.total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Ürün Sayısı:</span>
                      <span>{table.currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Durum:</span>
                      <Badge variant="outline" className="text-xs">
                        {table.currentOrder.status === "tamamlandi" ? "Tamamlandı" : "Devam Ediyor"}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t pt-3">
                    <h4 className="text-sm font-medium mb-2">Sipariş Detayları:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {table.currentOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs">
                          <span>
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          <span>₺{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Dialog
                    open={isPaymentDialogOpen && selectedTable?.id === table.id}
                    onOpenChange={(open) => {
                      setIsPaymentDialogOpen(open)
                      if (open) {
                        setSelectedTable(table)
                        setCashReceived("")
                      } else {
                        setSelectedTable(null)
                        setCashReceived("")
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full" onClick={() => setSelectedTable(table)}>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Ödeme Al
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Ödeme Al - Masa {table.number}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Toplam Tutar:</span>
                            <span className="text-green-600">₺{table.currentOrder.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Ödeme Yöntemi:</Label>
                          <Select
                            value={paymentMethod}
                            onValueChange={(value) => {
                              setPaymentMethod(value as PaymentMethod)
                              setCashReceived("")
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={PaymentMethod.CASH}>💵 Nakit</SelectItem>
                              <SelectItem value={PaymentMethod.CARD}>💳 Kart</SelectItem>
                              <SelectItem value={PaymentMethod.DIGITAL}>📱 Dijital</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {paymentMethod === PaymentMethod.CASH && (
                          <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Calculator className="w-4 h-4 text-blue-600" />
                              <Label className="text-sm font-medium text-blue-800">Nakit Hesaplama</Label>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="cashReceived" className="text-sm">
                                Müşteriden Alınan Tutar (₺):
                              </Label>
                              <Input
                                id="cashReceived"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={cashReceived}
                                onChange={(e) => setCashReceived(e.target.value)}
                                className="text-lg font-semibold"
                              />
                            </div>

                            {cashReceived && (
                              <div className="space-y-2 pt-2 border-t border-blue-200">
                                <div className="flex justify-between text-sm">
                                  <span>Alınan Tutar:</span>
                                  <span className="font-semibold">
                                    ₺{Number.parseFloat(cashReceived || "0").toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Sipariş Tutarı:</span>
                                  <span className="font-semibold">₺{table.currentOrder.total.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t border-blue-200 pt-2">
                                  <span>Para Üstü:</span>
                                  <span className={calculateChange() >= 0 ? "text-green-600" : "text-red-600"}>
                                    ₺{calculateChange().toFixed(2)}
                                  </span>
                                </div>
                                {calculateChange() < 0 && (
                                  <p className="text-xs text-red-600 text-center">
                                    ⚠️ Yetersiz ödeme! En az ₺{table.currentOrder.total.toFixed(2)} gerekli.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)} className="flex-1">
                            İptal
                          </Button>
                          <Button onClick={handlePaymentReceived} className="flex-1" disabled={!isPaymentValid()}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Ödeme Alındı
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {tables.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ödeme Bekleyen Masa Yok</h3>
            <p className="text-gray-600">Şu anda ödeme bekleyen masa bulunmuyor.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
