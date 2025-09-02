// Database connection utility for MySQL
// This would be used in a production environment with actual MySQL connection

import mysql from "mysql2/promise"

interface DatabaseConfig {
  host: string
  user: string
  password: string
  database: string
  port: number
}

// Configuration for XAMPP default MySQL setup
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_pos",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

let connection: mysql.Connection | null = null

export async function getConnection(): Promise<mysql.Connection> {
  if (!connection) {
    connection = await mysql.createConnection(dbConfig)
  }
  return connection
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const conn = await getConnection()
    const [rows] = await conn.execute(query, params)
    return rows as T[]
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

export async function executeTransaction<T>(queries: Array<{ query: string; params: any[] }>): Promise<T[]> {
  const conn = await getConnection()

  try {
    await conn.beginTransaction()

    const results: T[] = []
    for (const { query, params } of queries) {
      const [rows] = await conn.execute(query, params)
      results.push(rows as T)
    }

    await conn.commit()
    return results
  } catch (error) {
    await conn.rollback()
    throw error
  }
}

// Example usage functions for production MySQL integration:

export const dbQueries = {
  // Tables
  getAllTables: () => executeQuery("SELECT * FROM restaurant_tables ORDER BY number"),

  createTable: (id: string, number: string, capacity: number) =>
    executeQuery("INSERT INTO restaurant_tables (id, number, capacity) VALUES (?, ?, ?)", [id, number, capacity]),

  updateTableStatus: (id: string, status: string) =>
    executeQuery("UPDATE restaurant_tables SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]),

  // Menu Items
  getAllMenuItems: () => executeQuery("SELECT * FROM menu_items WHERE available = TRUE"),

  getMenuItemsByCategory: (category: string) =>
    executeQuery("SELECT * FROM menu_items WHERE category = ? AND available = TRUE", [category]),

  // Orders
  createOrder: (id: string, tableId: string, userId: string, total: number) =>
    executeQuery("INSERT INTO orders (id, table_id, user_id, total) VALUES (?, ?, ?, ?)", [id, tableId, userId, total]),

  getOrdersByStatus: (status: string) => executeQuery("SELECT * FROM orders WHERE status = ?", [status]),

  updateOrderStatus: (id: string, status: string) =>
    executeQuery("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [status, id]),

  // Order Items
  createOrderItem: (id: string, orderId: string, menuItemId: string, quantity: number, price: number) =>
    executeQuery("INSERT INTO order_items (id, order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?, ?)", [
      id,
      orderId,
      menuItemId,
      quantity,
      price,
    ]),

  // Reports
  getDailySales: (date: string) => executeQuery("SELECT * FROM daily_sales WHERE date = ?", [date]),

  getTopSellingItems: (startDate: string, endDate: string) =>
    executeQuery(
      `
      SELECT 
        mi.id,
        mi.name,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      JOIN orders o ON oi.order_id = o.id
      WHERE o.created_at BETWEEN ? AND ?
      GROUP BY mi.id, mi.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `,
      [startDate, endDate],
    ),
}
