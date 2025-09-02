export enum UserRole {
  WAITER = "garson",
  CASHIER = "kasiyer",
  MANAGER = "mudur",
  ADMIN = "admin",
  KITCHEN = "mutfak",
}

export enum TableStatus {
  AVAILABLE = "musait",
  OCCUPIED = "dolu",
  RESERVED = "rezerve",
  CLEANING = "temizlik",
}

export enum OrderStatus {
  PENDING = "bekliyor",
  PREPARING = "hazirlaniyor",
  READY = "hazir",
  COMPLETED = "tamamlandi",
  CANCELLED = "iptal",
}

export enum MenuCategory {
  STARTERS = "starters",
  MAINS = "mains",
  DESSERTS = "desserts",
  DRINKS = "drinks",
  TATLILAR = "tatlilar",
  CLASSIC_COFFEE = "classic_coffee",
  HOT_CHOCOLATE = "hot_chocolate",
  COFFEE_SPECIALS = "coffee_specials",
  RUM_KONYAK_GIN = "rum_konyak_gin",
  WHISKEY = "whiskey",
  ICE_LATTE = "ice_latte",
  COFFEE_CHILLER = "coffee_chiller",
  FRESHLY_SQUEEZED_JUICES = "freshly_squeezed_juices",
  INTERNATIONAL_KOKTEYL = "international_kokteyl",
  SIGNATURA_IZZARO = "signatura_izzaro",
  SMOOTHIE_FRUIT_SPILLS = "smoothie_fruit_spills",
  ITALIAN_SODA = "italian_soda",
  TROPICAL_CHILLERS = "tropical_chillers",
  MILK_SHAKE = "milk_shake",
}

export enum PaymentMethod {
  CASH = "nakit",
  CARD = "kart",
  DIGITAL = "dijital",
}

export enum NotificationType {
  ORDER_READY = "order_ready",
  ORDER_CANCELLED = "order_cancelled",
  TABLE_REQUEST = "table_request",
  TABLE_CLEANING = "table_cleaning",
}

export enum ActivityType {
  ORDER_CREATED = "order_created",
  ORDER_UPDATED = "order_updated",
  ORDER_COMPLETED = "order_completed",
  PAYMENT_RECEIVED = "payment_received",
  TABLE_CLEANED = "table_cleaned",
  TABLE_STATUS_CHANGED = "table_status_changed",
  USER_LOGIN = "user_login",
  USER_LOGOUT = "user_logout",
}

export interface User {
  id: string
  name: string
  username: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}

export interface Table {
  id: string
  number: string
  capacity: number
  status: TableStatus
  currentOrder?: Order
  createdAt: Date
  updatedAt: Date
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: MenuCategory
  available: boolean
  preparationTime: number // in minutes
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
  price: number
  notes?: string
}

export interface Order {
  id: string
  tableId: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface Payment {
  id: string
  orderId: string
  tableId: string
  amount: number
  method: PaymentMethod
  status: "pending" | "completed" | "failed"
  processedBy: string
  createdAt: Date
}

export interface DailySales {
  date: string
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  topSellingItems: Array<{
    menuItemId: string
    name: string
    quantity: number
    revenue: number
  }>
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface CreateUserData {
  name: string
  username: string
  password: string
  role: UserRole
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  orderId?: string
  tableId?: string
  tableNumber?: string
  isRead: boolean
  createdAt: Date
  targetRoles: UserRole[]
}

export interface ActivityLog {
  id: string
  type: ActivityType
  description: string
  userId: string
  userName: string
  tableId?: string
  tableNumber?: string
  orderId?: string
  amount?: number
  details?: any
  createdAt: Date
}
