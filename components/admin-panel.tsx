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
import { Trash2, Plus, Edit, Users, Eye, EyeOff } from 'lucide-react'
import { type User, type CreateUserData, UserRole } from "@/lib/types"
import { authService } from "@/lib/services/auth-service"
import { Switch } from "@/components/ui/switch"

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [search, setSearch] = useState("")

  const [newUser, setNewUser] = useState<CreateUserData>({
    name: "",
    username: "",
    password: "",
    role: UserRole.WAITER,
  })

  const [editUser, setEditUser] = useState<{
    name: string
    username: string
    role: UserRole
    password?: string
    isActive: boolean
  }>({
    name: "",
    username: "",
    role: UserRole.WAITER,
    password: "",
    isActive: true,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const usersData = await authService.getAllUsers(search)
      setUsers(usersData)
    } catch (err) {
      setError("Kullanıcılar yüklenirken hata oluştu")
    }
  }

  const handleCreateUser = async () => {
    setError("")
    setSuccess("")

    if (!newUser.name.trim() || !newUser.username.trim() || !newUser.password.trim()) {
      setError("Tüm alanları doldurun")
      return
    }

    try {
      await authService.createUser(newUser)
      setSuccess("Kullanıcı başarıyla oluşturuldu")
      setNewUser({ name: "", username: "", password: "", role: UserRole.WAITER })
      setIsCreateDialogOpen(false)
      loadUsers()
    } catch (err: any) {
      setError(err.message || "Kullanıcı oluşturulurken hata oluştu")
    }
  }

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      name: user.name,
      username: user.username,
      role: user.role as UserRole,
      password: "",
      isActive: user.isActive ?? true,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedUser) return
    setError("")
    setSuccess("")

    if (!editUser.name.trim() || !editUser.username.trim()) {
      setError("Ad Soyad ve Kullanıcı Adı zorunludur")
      return
    }

    try {
      const payload: Partial<User> = {
        name: editUser.name.trim(),
        username: editUser.username.trim(),
        role: editUser.role,
        isActive: editUser.isActive,
      }
      if (editUser.password && editUser.password.trim()) {
        payload.password = editUser.password.trim()
      }

      const updated = await authService.updateUser(selectedUser.id, payload)
      setSuccess("Kullanıcı güncellendi")
      setIsEditDialogOpen(false)
      // update local list without refetch to feel snappier
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)))
    } catch (err: any) {
      setError(err.message || "Kullanıcı güncellenirken hata oluştu")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      try {
        await authService.deleteUser(userId)
        setSuccess("Kullanıcı başarıyla silindi")
        loadUsers()
      } catch (err) {
        setError("Kullanıcı silinirken hata oluştu")
      }
    }
  }

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }))
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800 border-red-200"
      case UserRole.MANAGER:
        return "bg-purple-100 text-purple-800 border-purple-200"
      case UserRole.CASHIER:
        return "bg-teal-100 text-teal-800 border-teal-200"
      case UserRole.WAITER:
        return "bg-green-100 text-green-800 border-green-200"
      case UserRole.KITCHEN:
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
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
        return role
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          <p className="text-gray-600">Sistem kullanıcılarını yönetin</p>
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Ara: ad veya kullanıcı adı"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
            className="w-56"
          />
          <Button variant="secondary" onClick={loadUsers}>
            Ara
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Yeni Kullanıcı Oluştur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad Soyad</Label>
                  <Input
                    id="name"
                    placeholder="Kullanıcının adını girin"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı</Label>
                  <Input
                    id="username"
                    placeholder="Kullanıcı adını girin"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Şifre girin"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.WAITER}>Garson</SelectItem>
                      <SelectItem value={UserRole.CASHIER}>Kasiyer</SelectItem>
                      <SelectItem value={UserRole.KITCHEN}>Mutfak</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Müdür</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Yönetici</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">
                  Kullanıcı Oluştur
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                </div>
                <Badge className={getRoleBadgeColor(user.role)}>{getRoleDisplayName(user.role)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Şifre:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-mono">{showPasswords[user.id] ? user.password : "••••••••"}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePasswordVisibility(user.id)}
                    className="h-6 w-6 p-0"
                    aria-label="Şifreyi göster/gizle"
                  >
                    {showPasswords[user.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                Oluşturulma: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(user)} className="flex-1">
                  <Edit className="w-3 h-3 mr-1" />
                  Düzenle
                </Button>
                {user.role !== UserRole.ADMIN && (
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteUser(user.id)} className="flex-1">
                    <Trash2 className="w-3 h-3 mr-1" />
                    Sil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Kullanıcı İstatistikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">{users.length}</div>
              <div className="text-sm text-gray-600">Toplam</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {users.filter((u) => u.role === UserRole.WAITER).length}
              </div>
              <div className="text-sm text-gray-600">Garson</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-700">
                {users.filter((u) => u.role === UserRole.CASHIER).length}
              </div>
              <div className="text-sm text-gray-600">Kasiyer</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">
                {users.filter((u) => u.role === UserRole.KITCHEN).length}
              </div>
              <div className="text-sm text-gray-600">Mutfak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">
                {users.filter((u) => u.role === UserRole.MANAGER).length}
              </div>
              <div className="text-sm text-gray-600">Müdür</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Ad Soyad</Label>
                  <Input
                    id="edit-name"
                    value={editUser.name}
                    onChange={(e) => setEditUser((s) => ({ ...s, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Kullanıcı Adı</Label>
                  <Input
                    id="edit-username"
                    value={editUser.username}
                    onChange={(e) => setEditUser((s) => ({ ...s, username: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select
                    value={editUser.role}
                    onValueChange={(value) => setEditUser((s) => ({ ...s, role: value as UserRole }))}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Rol seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.WAITER}>Garson</SelectItem>
                      <SelectItem value={UserRole.CASHIER}>Kasiyer</SelectItem>
                      <SelectItem value={UserRole.KITCHEN}>Mutfak</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Müdür</SelectItem>
                      <SelectItem value={UserRole.ADMIN}>Yönetici</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-active">Durum</Label>
                  <div className="h-10 px-3 rounded-md border flex items-center justify-between">
                    <span className="text-sm text-gray-600">{editUser.isActive ? "Aktif" : "Pasif"}</span>
                    <Switch checked={!!editUser.isActive} onCheckedChange={(v) => setEditUser((s) => ({ ...s, isActive: v }))} />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">Şifre (Opsiyonel)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Boş bırakılırsa değişmez"
                  value={editUser.password || ""}
                  onChange={(e) => setEditUser((s) => ({ ...s, password: e.target.value }))}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveEdit} className="flex-1">
                  Kaydet
                </Button>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  İptal
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
