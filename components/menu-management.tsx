"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { type MenuItem, MenuCategory, type User } from "@/lib/types"
import { menuServiceClient } from "@/lib/services/menu-service-client"
import { useToast } from "@/hooks/use-toast"

interface MenuManagementProps {
  currentUser: User
}

export default function MenuManagement({ currentUser }: MenuManagementProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(MenuCategory.TATLILAR)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([])
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: MenuCategory.TATLILAR,
    preparationTime: "15",
    available: true,
  })

  useEffect(() => {
    loadMenuItems()
  }, [])

  useEffect(() => {
    filterItems()
  }, [menuItems, selectedCategory, searchTerm])

  const loadMenuItems = async () => {
    const items = await menuServiceClient.getAllMenuItems()
    setMenuItems(items)
  }

  const filterItems = () => {
    let filtered = menuItems.filter((item) => item.category === selectedCategory)

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredItems(filtered)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: MenuCategory.TATLILAR,
      preparationTime: "15",
      available: true,
    })
  }

  const handleAddItem = async () => {
    if (!formData.name || !formData.price) {
      toast({
        title: "Hata",
        description: "Ürün adı ve fiyat zorunludur",
        variant: "destructive",
      })
      return
    }

    const newItem = await menuServiceClient.createMenuItem({
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      preparationTime: Number.parseInt(formData.preparationTime),
      available: formData.available,
    })

    if (newItem) {
      await loadMenuItems()
      setIsAddDialogOpen(false)
      resetForm()
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla eklendi",
      })
    } else {
      toast({
        title: "Hata",
        description: "Ürün eklenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleEditItem = async () => {
    if (!editingItem || !formData.name || !formData.price) {
      toast({
        title: "Hata",
        description: "Ürün adı ve fiyat zorunludur",
        variant: "destructive",
      })
      return
    }

    const updatedItem = await menuServiceClient.updateMenuItem(editingItem.id, {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      preparationTime: Number.parseInt(formData.preparationTime),
      available: formData.available,
    })

    if (updatedItem) {
      await loadMenuItems()
      setIsEditDialogOpen(false)
      setEditingItem(null)
      resetForm()
      toast({
        title: "Başarılı",
        description: "Ürün başarıyla güncellendi",
      })
    } else {
      toast({
        title: "Hata",
        description: "Ürün güncellenirken bir hata oluştu",
        variant: "destructive",
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      const success = await menuServiceClient.deleteMenuItem(id)
      if (success) {
        await loadMenuItems()
        toast({
          title: "Başarılı",
          description: "Ürün başarıyla silindi",
        })
      } else {
        toast({
          title: "Hata",
          description: "Ürün silinirken bir hata oluştu",
          variant: "destructive",
        })
      }
    }
  }

  const openEditDialog = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
      preparationTime: item.preparationTime.toString(),
      available: item.available,
    })
    setIsEditDialogOpen(true)
  }

  const getCategoryName = (category: MenuCategory) => {
    const names = {
      [MenuCategory.TATLILAR]: "Tatlılar",
      [MenuCategory.CLASSIC_COFFEE]: "Classic Coffee",
      [MenuCategory.HOT_CHOCOLATE]: "Hot Chocolate",
      [MenuCategory.COFFEE_SPECIALS]: "Coffee Specials",
      [MenuCategory.RUM_KONYAK_GIN]: "Rum/Konyak Gin",
      [MenuCategory.WHISKEY]: "Whiskey",
      [MenuCategory.ICE_LATTE]: "Ice Latte",
      [MenuCategory.COFFEE_CHILLER]: "Coffee Chiller",
      [MenuCategory.FRESHLY_SQUEEZED_JUICES]: "Freshly Squeezed Juices",
      [MenuCategory.INTERNATIONAL_KOKTEYL]: "International Kokteyl",
      [MenuCategory.SIGNATURA_IZZARO]: "Signatura Izzaro",
      [MenuCategory.SMOOTHIE_FRUIT_SPILLS]: "Smoothie Fruit Spills",
      [MenuCategory.ITALIAN_SODA]: "Italian Soda",
      [MenuCategory.TROPICAL_CHILLERS]: "Tropical Chillers",
      [MenuCategory.MILK_SHAKE]: "Milk Shake",
      // Keep old categories for backward compatibility during migration
      [MenuCategory.STARTERS]: "Hot Coffee",
      [MenuCategory.MAINS]: "Ice Coffee",
      [MenuCategory.DESSERTS]: "Alkoller",
      [MenuCategory.DRINKS]: "Diğerleri",
    }
    return names[category]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Menü Yönetimi</h2>
          <p className="text-gray-600">Menü öğelerini yönetin ve düzenleyin</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Ürün Ekle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ürün Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ürün adını girin"
                />
              </div>
              <div>
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ürün açıklamasını girin"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Fiyat (₺)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="preparationTime">Hazırlık Süresi (dk)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as MenuCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MenuCategory.TATLILAR}>Tatlılar</SelectItem>
                    <SelectItem value={MenuCategory.CLASSIC_COFFEE}>Classic Coffee</SelectItem>
                    <SelectItem value={MenuCategory.HOT_CHOCOLATE}>Hot Chocolate</SelectItem>
                    <SelectItem value={MenuCategory.COFFEE_SPECIALS}>Coffee Specials</SelectItem>
                    <SelectItem value={MenuCategory.RUM_KONYAK_GIN}>Rum/Konyak Gin</SelectItem>
                    <SelectItem value={MenuCategory.WHISKEY}>Whiskey</SelectItem>
                    <SelectItem value={MenuCategory.ICE_LATTE}>Ice Latte</SelectItem>
                    <SelectItem value={MenuCategory.COFFEE_CHILLER}>Coffee Chiller</SelectItem>
                    <SelectItem value={MenuCategory.FRESHLY_SQUEEZED_JUICES}>Freshly Squeezed Juices</SelectItem>
                    <SelectItem value={MenuCategory.INTERNATIONAL_KOKTEYL}>International Kokteyl</SelectItem>
                    <SelectItem value={MenuCategory.SIGNATURA_IZZARO}>Signatura Izzaro</SelectItem>
                    <SelectItem value={MenuCategory.SMOOTHIE_FRUIT_SPILLS}>Smoothie Fruit Spills</SelectItem>
                    <SelectItem value={MenuCategory.ITALIAN_SODA}>Italian Soda</SelectItem>
                    <SelectItem value={MenuCategory.TROPICAL_CHILLERS}>Tropical Chillers</SelectItem>
                    <SelectItem value={MenuCategory.MILK_SHAKE}>Milk Shake</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Mevcut</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  İptal
                </Button>
                <Button onClick={handleAddItem}>Ekle</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Menu Categories */}
      <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as MenuCategory)}>
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-max min-w-full">
            <TabsTrigger value={MenuCategory.TATLILAR}>Tatlılar</TabsTrigger>
            <TabsTrigger value={MenuCategory.CLASSIC_COFFEE}>Classic Coffee</TabsTrigger>
            <TabsTrigger value={MenuCategory.HOT_CHOCOLATE}>Hot Chocolate</TabsTrigger>
            <TabsTrigger value={MenuCategory.COFFEE_SPECIALS}>Coffee Specials</TabsTrigger>
            <TabsTrigger value={MenuCategory.RUM_KONYAK_GIN}>Rum/Konyak Gin</TabsTrigger>
            <TabsTrigger value={MenuCategory.WHISKEY}>Whiskey</TabsTrigger>
            <TabsTrigger value={MenuCategory.ICE_LATTE}>Ice Latte</TabsTrigger>
            <TabsTrigger value={MenuCategory.COFFEE_CHILLER}>Coffee Chiller</TabsTrigger>
            <TabsTrigger value={MenuCategory.FRESHLY_SQUEEZED_JUICES}>Freshly Squeezed Juices</TabsTrigger>
            <TabsTrigger value={MenuCategory.INTERNATIONAL_KOKTEYL}>International Kokteyl</TabsTrigger>
            <TabsTrigger value={MenuCategory.SIGNATURA_IZZARO}>Signatura Izzaro</TabsTrigger>
            <TabsTrigger value={MenuCategory.SMOOTHIE_FRUIT_SPILLS}>Smoothie Fruit Spills</TabsTrigger>
            <TabsTrigger value={MenuCategory.ITALIAN_SODA}>Italian Soda</TabsTrigger>
            <TabsTrigger value={MenuCategory.TROPICAL_CHILLERS}>Tropical Chillers</TabsTrigger>
            <TabsTrigger value={MenuCategory.MILK_SHAKE}>Milk Shake</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(item)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{item.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-green-600">₺{item.price.toFixed(2)}</span>
                    <Badge variant={item.available ? "default" : "secondary"}>
                      {item.available ? "Mevcut" : "Mevcut Değil"}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">Hazırlık süresi: {item.preparationTime} dakika</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm
                  ? "Arama kriterlerinize uygun ürün bulunamadı"
                  : `${getCategoryName(selectedCategory)} kategorisinde ürün bulunamadı`}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürün Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Ürün Adı</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ürün adını girin"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ürün açıklamasını girin"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-price">Fiyat (₺)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-preparationTime">Hazırlık Süresi (dk)</Label>
                <Input
                  id="edit-preparationTime"
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as MenuCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MenuCategory.TATLILAR}>Tatlılar</SelectItem>
                  <SelectItem value={MenuCategory.CLASSIC_COFFEE}>Classic Coffee</SelectItem>
                  <SelectItem value={MenuCategory.HOT_CHOCOLATE}>Hot Chocolate</SelectItem>
                  <SelectItem value={MenuCategory.COFFEE_SPECIALS}>Coffee Specials</SelectItem>
                  <SelectItem value={MenuCategory.RUM_KONYAK_GIN}>Rum/Konyak Gin</SelectItem>
                  <SelectItem value={MenuCategory.WHISKEY}>Whiskey</SelectItem>
                  <SelectItem value={MenuCategory.ICE_LATTE}>Ice Latte</SelectItem>
                  <SelectItem value={MenuCategory.COFFEE_CHILLER}>Coffee Chiller</SelectItem>
                  <SelectItem value={MenuCategory.FRESHLY_SQUEEZED_JUICES}>Freshly Squeezed Juices</SelectItem>
                  <SelectItem value={MenuCategory.INTERNATIONAL_KOKTEYL}>International Kokteyl</SelectItem>
                  <SelectItem value={MenuCategory.SIGNATURA_IZZARO}>Signatura Izzaro</SelectItem>
                  <SelectItem value={MenuCategory.SMOOTHIE_FRUIT_SPILLS}>Smoothie Fruit Spills</SelectItem>
                  <SelectItem value={MenuCategory.ITALIAN_SODA}>Italian Soda</SelectItem>
                  <SelectItem value={MenuCategory.TROPICAL_CHILLERS}>Tropical Chillers</SelectItem>
                  <SelectItem value={MenuCategory.MILK_SHAKE}>Milk Shake</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label htmlFor="edit-available">Mevcut</Label>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                İptal
              </Button>
              <Button onClick={handleEditItem}>Güncelle</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
