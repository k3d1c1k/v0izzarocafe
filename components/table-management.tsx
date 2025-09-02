"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Clock, DollarSign, Sparkles } from "lucide-react"
import { type Table, TableStatus, type User } from "@/lib/types"
import { tableService } from "@/lib/services/table-service"
import { activityService } from "@/lib/services/activity-service"

interface TableManagementProps {
  currentUser: User
}

export default function TableManagement({ currentUser }: TableManagementProps) {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTableNumber, setNewTableNumber] = useState("")
  const [newTableCapacity, setNewTableCapacity] = useState("4")

  useEffect(() => {
    loadTables()
    const interval = setInterval(loadTables, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadTables = async () => {
    const tablesData = await tableService.getAllTables()
    setTables(tablesData)
  }

  const handleCreateTable = async () => {
    if (newTableNumber.trim()) {
      await tableService.createTable({
        number: newTableNumber.trim(),
        capacity: Number.parseInt(newTableCapacity),
        status: TableStatus.AVAILABLE,
      })
      setNewTableNumber("")
      setNewTableCapacity("4")
      setIsCreateDialogOpen(false)
      loadTables()
    }
  }

  const handleTableStatusChange = async (tableId: string, newStatus: TableStatus) => {
    const table = tables.find((t) => t.id === tableId)
    if (!table) return

    const oldStatus = table.status
    await tableService.updateTableStatus(tableId, newStatus)

    // Log the status change
    await activityService.logTableStatusChanged(
      currentUser.id,
      currentUser.name,
      tableId,
      table.number,
      getStatusText(oldStatus),
      getStatusText(newStatus),
    )

    loadTables()
  }

  const handleTableCleaned = async (tableId: string) => {
    const table = tables.find((t) => t.id === tableId)
    if (!table) return

    // Change status to available
    await tableService.updateTableStatus(tableId, "musait")

    // Log the cleaning activity
    await activityService.logTableCleaned(currentUser.id, currentUser.name, tableId, table.number)

    loadTables()
  }

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "musait":
        return "bg-green-100 text-green-800 border-green-200"
      case "dolu":
        return "bg-red-100 text-red-800 border-red-200"
      case "rezerve":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "temizlik":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: TableStatus) => {
    switch (status) {
      case "musait":
        return "Müsait"
      case "dolu":
        return "Dolu"
      case "rezerve":
        return "Rezerve"
      case "temizlik":
        return "Temizlik"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Masa Yönetimi</h2>
          <p className="text-gray-600">Restoran masalarını ve durumlarını yönetin</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Masa Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Masa Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Masa Numarası</Label>
                <Input
                  id="tableNumber"
                  placeholder="örn: M1, A5, vb."
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Kapasite</Label>
                <Select value={newTableCapacity} onValueChange={setNewTableCapacity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 kişi</SelectItem>
                    <SelectItem value="4">4 kişi</SelectItem>
                    <SelectItem value="6">6 kişi</SelectItem>
                    <SelectItem value="8">8 kişi</SelectItem>
                    <SelectItem value="10">10 kişi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTable} className="w-full">
                Masa Oluştur
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTable?.id === table.id ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setSelectedTable(table)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Masa {table.number}</CardTitle>
                <Badge className={getStatusColor(table.status)}>{getStatusText(table.status)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="w-4 h-4 mr-2" />
                Kapasite: {table.capacity}
              </div>

              {table.currentOrder && (
                <>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(table.currentOrder.createdAt).toLocaleTimeString("tr-TR")}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />₺{table.currentOrder.total.toFixed(2)}
                  </div>
                </>
              )}

              <div className="flex space-x-2">
                {table.status === "musait" && (
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTableStatusChange(table.id, "dolu")
                    }}
                  >
                    Müşteri Otur
                  </Button>
                )}
                {table.status === "dolu" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTableStatusChange(table.id, "temizlik")
                    }}
                  >
                    Masayı Temizle
                  </Button>
                )}
                {table.status === "temizlik" && (
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTableCleaned(table.id)
                    }}
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Temizlendi
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Details */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>Masa {selectedTable.number} Detayları</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Durum</Label>
                <Select
                  value={selectedTable.status}
                  onValueChange={(status) => handleTableStatusChange(selectedTable.id, status as TableStatus)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="musait">Müsait</SelectItem>
                    <SelectItem value="dolu">Dolu</SelectItem>
                    <SelectItem value="rezerve">Rezerve</SelectItem>
                    <SelectItem value="temizlik">Temizlik</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Kapasite</Label>
                <Input value={selectedTable.capacity} disabled />
              </div>
              <div>
                <Label>Mevcut Sipariş Toplamı</Label>
                <Input
                  value={
                    selectedTable.currentOrder ? `₺${selectedTable.currentOrder.total.toFixed(2)}` : "Aktif sipariş yok"
                  }
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
