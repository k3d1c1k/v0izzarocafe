const mysql = require("mysql2/promise")
const fs = require("fs").promises
const path = require("path")

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_pos",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

async function seedDatabase() {
  let connection

  try {
    console.log("🔄 Örnek veriler ekleniyor...")

    connection = await mysql.createConnection(dbConfig)
    console.log("✅ Veritabanına bağlanıldı")

    // Clear existing data
    console.log("🧹 Mevcut veriler temizleniyor...")
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0")
    await connection.execute("DELETE FROM order_items")
    await connection.execute("DELETE FROM orders")
    await connection.execute("DELETE FROM payments")
    await connection.execute("DELETE FROM daily_sales")
    await connection.execute("DELETE FROM users")
    await connection.execute("DELETE FROM restaurant_tables")
    await connection.execute("DELETE FROM menu_items")
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1")

    // Insert users
    const users = [
      ["admin-1", "Sistem Yöneticisi", "admin", "admin123", "admin", true],
      ["user-1", "Ahmet Garson", "ahmet", "123456", "garson", true],
      ["user-2", "Ayşe Kasiyer", "ayse", "123456", "kasiyer", true],
      ["user-3", "Mehmet Müdür", "mehmet", "123456", "mudur", true],
      ["user-4", "Fatma Garson", "fatma", "123456", "garson", true],
      ["user-5", "Ali Kasiyer", "ali", "123456", "kasiyer", true],
    ]

    for (const user of users) {
      await connection.execute(
        "INSERT INTO users (id, name, username, password, role, is_active) VALUES (?, ?, ?, ?, ?, ?)",
        user,
      )
    }
    console.log("   ✅ Kullanıcılar eklendi")

    // Insert tables
    const tables = [
      ["table-1", "M1", 4, "musait"],
      ["table-2", "M2", 2, "musait"],
      ["table-3", "M3", 6, "dolu"],
      ["table-4", "M4", 4, "musait"],
      ["table-5", "M5", 8, "rezerve"],
      ["table-6", "M6", 2, "temizlik"],
      ["table-7", "M7", 4, "musait"],
      ["table-8", "M8", 6, "musait"],
      ["table-9", "M9", 2, "musait"],
      ["table-10", "M10", 10, "musait"],
    ]

    for (const table of tables) {
      await connection.execute(
        "INSERT INTO restaurant_tables (id, number, capacity, status) VALUES (?, ?, ?, ?)",
        table,
      )
    }
    console.log("   ✅ Masalar eklendi")

    // Insert menu items
    const menuItems = [
     // Başlangıçlar
      ["menu-1", "AMERICANO ", "Taze marul, parmesan peyniri ve kruton ile", 24.99, "starters", 10],
      ["menu-2", "LATTE ", "Acılı buffalo soslu kanatlar, mavi peynir sosu ile", 29.99, "starters", 15],
      ["menu-3", "ESPRESSO ", "Çıtır paneli mozzarella, marinara sosu ile", 19.99, "starters", 12],
      ["menu-4", "CAPPUCHINO ", "Kızarmış ekmek üzerinde taze domates ve fesleğen", 17.99, "starters", 8],
      ["menu-5", "FRENCH COFFEE LATTE", "Çıtır soğan halkaları, ranch sosu ile", 16.99, "starters", 10],
      ["menu-6", "LOTUS LATTE", "Çıtır soğan halkaları, ranch sosu ile", 16.99, "starters", 10],
      ["menu-7", "CORTADO ", "Çıtır soğan halkaları, ranch sosu ile", 16.99, "starters", 10],
      ["menu-8", "FLAT WHITE", "Çıtır soğan halkaları, ranch sosu ile", 16.99, "starters", 10],
      ["menu-9", "CLASSIC CHOCOLATE ", "Çıtır soğan halkaları, ranch sosu ile", 16.99, "starters", 10],
      ["menu-10", "TURKISH COFFEE", "Çıtır soğan halkaları, ranch sosu ile", 16.99, "starters", 10],

      // Ana Yemekler
      ["menu-11", "ICE AMERICANO", "Taze Atlantik somonu, limonlu tereyağı ile", 49.99, "mains", 20],
      ["menu-12", "ICE LATTE ", "300gr prime ribeye, istediğiniz pişirme derecesinde", 65.99, "mains", 25],
      ["menu-13", "ICE VANILLA", "Paneli tavuk göğsü, marinara ve mozzarella ile", 39.99, "mains", 18],
      ["menu-14", "ICE CARAMEL", "Kremalı makarna, pastırma ve parmesan ile", 33.99, "mains", 15],
      ["menu-15", "ICE COCONUT", "Bira hamuruyla kaplı morina, çıtır patates ile", 37.99, "mains", 20],
      ["menu-16", "ICE OREO", "Bira hamuruyla kaplı morina, çıtır patates ile", 37.99, "mains", 20],
      ["menu-17", "ICE FRAPPE", "Bira hamuruyla kaplı morina, çıtır patates ile", 37.99, "mains", 20],
      ["menu-18", "CARAMEL VOLTAGE", "Bira hamuruyla kaplı morina, çıtır patates ile", 37.99, "mains", 20],
      ["menu-19", "COCONUT VOLTAGE ", "Bira hamuruyla kaplı morina, çıtır patates ile", 37.99, "mains", 20],
      ["menu-20", "TOFFINUT VOLTAGE", "Bira hamuruyla kaplı morina, çıtır patates ile", 37.99, "mains", 20],

      // Tatlılar
      ["menu-21", "BACARDI ", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-22", "SMIRNOFF ", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-23", "HENDRICKS ", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-24", "TANGUERAY ", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-25", "PINK GİN", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-26", "DALMORE ", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-27", "MOJITO ", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-28", "SEX ON THE BEACH", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-29", "LYNCBURG LEMONATE", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      ["menu-30", "MELODI IZZARO", "Zengin çikolatalı pasta, vanilyalı dondurma ile", 17.99, "desserts", 5],
      

      // İçecekler
      ["menu-31", "ITALIAN SODA APPLE", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-32", "MANGO CHILLERS", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-33", "PROTEIN SMOOTHIE", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-34", "MILKSHAKE CHOCOLATE", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-35", "ORANGE JUICE", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-36", "MILKSHAKE VANILLA ", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-37", "MILKSHAKE LOTUS ", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-38", "MIX JUICE", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-39", "ITALIAN SODA MELON ", "Klasik gazlı içecek", 5.99, "drinks", 1],
      ["menu-40", "ITALIAN SODA STRAWBERRY  ", "Klasik gazlı içecek", 5.99, "drinks", 1],
   
    ]

    for (const item of menuItems) {
      await connection.execute(
        "INSERT INTO menu_items (id, name, description, price, category, preparation_time) VALUES (?, ?, ?, ?, ?, ?)",
        item,
      )
    }
    console.log("   ✅ Menü öğeleri eklendi")

    // Show summary
    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [tableCount] = await connection.execute("SELECT COUNT(*) as count FROM restaurant_tables")
    const [menuCount] = await connection.execute("SELECT COUNT(*) as count FROM menu_items")

    console.log("\n📊 Eklenen veriler:")
    console.log(`   - ${userCount[0].count} kullanıcı`)
    console.log(`   - ${tableCount[0].count} masa`)
    console.log(`   - ${menuCount[0].count} menü öğesi`)

    console.log("\n🎉 Örnek veriler başarıyla eklendi!")
  } catch (error) {
    console.error("❌ Veri ekleme sırasında hata:", error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

seedDatabase()
