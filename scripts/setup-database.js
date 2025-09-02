const mysql = require("mysql2/promise")
const fs = require("fs").promises
const path = require("path")

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  multipleStatements: false, // Disable multiple statements for prepared statements
}

const dbName = process.env.DB_NAME || "restaurant_pos"

async function executeSQL(connection, sql) {
  // Split SQL into individual statements and execute them one by one
  const statements = sql
    .split(";")
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--") && !stmt.startsWith("/*"))

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await connection.execute(statement)
      } catch (error) {
        // Skip harmless errors like "database already exists"
        if (
          !error.message.includes("already exists") &&
          !error.message.includes("Duplicate entry") &&
          !error.message.includes("Unknown database")
        ) {
          console.log(`⚠️  SQL Uyarısı: ${statement.substring(0, 50)}...`)
          console.log(`   Hata: ${error.message}`)
        }
      }
    }
  }
}

async function setupDatabase() {
  let connection

  try {
    console.log("🔄 Veritabanı kurulumu başlatılıyor...")

    // Connect to MySQL server (without database)
    connection = await mysql.createConnection(dbConfig)
    console.log("✅ MySQL sunucusuna bağlanıldı")

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``)
    console.log(`✅ Veritabanı '${dbName}' oluşturuldu/kontrol edildi`)

    // Close connection and reconnect to the specific database
    await connection.end()

    // Reconnect with the database selected
    connection = await mysql.createConnection({
      ...dbConfig,
      database: dbName,
    })
    console.log(`✅ Veritabanı '${dbName}' seçildi`)

    console.log("🔄 Veritabanı şeması oluşturuluyor...")
    try {
      const schemaSQL = await fs.readFile(path.join(__dirname, "database-schema.sql"), "utf8")
      await executeSQL(connection, schemaSQL)
      console.log("   ✅ Veritabanı şeması oluşturuldu")
    } catch (error) {
      console.log(`⚠️  Şema oluşturma uyarısı: ${error.message}`)
    }

    console.log("🔄 Kategori güncellemeleri yapılıyor...")
    try {
      const migrationSQL = await fs.readFile(path.join(__dirname, "migrate-categories-v2.sql"), "utf8")
      await executeSQL(connection, migrationSQL)
      console.log("   ✅ Kategoriler güncellendi")
    } catch (error) {
      console.log(`⚠️  Kategori güncelleme uyarısı: ${error.message}`)
    }

    console.log("🔄 Tam menü verileri ekleniyor...")
    try {
      const completeMenuSQL = await fs.readFile(path.join(__dirname, "seed-complete-izzaro-menu.sql"), "utf8")
      await executeSQL(connection, completeMenuSQL)
      console.log("   ✅ Tam menü verileri eklendi")
    } catch (error) {
      console.log(`⚠️  Menü ekleme uyarısı: ${error.message}`)
    }

    // Create tables one by one
    console.log("🔄 Tablolar oluşturuluyor...")

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('garson', 'kasiyer', 'mudur', 'admin') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("   ✅ users tablosu oluşturuldu")

    // Restaurant tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS restaurant_tables (
        id VARCHAR(36) PRIMARY KEY,
        number VARCHAR(20) NOT NULL UNIQUE,
        capacity INT NOT NULL,
        status ENUM('musait', 'dolu', 'rezerve', 'temizlik') DEFAULT 'musait',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("   ✅ restaurant_tables tablosu oluşturuldu")

    // Menu items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        category ENUM('starters', 'mains', 'desserts', 'drinks') NOT NULL,
        available BOOLEAN DEFAULT TRUE,
        preparation_time INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("   ✅ menu_items tablosu oluşturuldu")

    // Orders table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        table_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36),
        status ENUM('bekliyor', 'hazirlaniyor', 'hazir', 'tamamlandi', 'iptal') DEFAULT 'bekliyor',
        total DECIMAL(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (table_id) REFERENCES restaurant_tables(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `)
    console.log("   ✅ orders tablosu oluşturuldu")

    // Order items table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        menu_item_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
      )
    `)
    console.log("   ✅ order_items tablosu oluşturuldu")

    // Payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        method ENUM('cash', 'card', 'digital') NOT NULL,
        status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )
    `)
    console.log("   ✅ payments tablosu oluşturuldu")

    // Daily sales table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS daily_sales (
        id VARCHAR(36) PRIMARY KEY,
        date DATE NOT NULL UNIQUE,
        total_sales DECIMAL(12, 2) DEFAULT 0,
        total_orders INT DEFAULT 0,
        average_order_value DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("   ✅ daily_sales tablosu oluşturuldu")

    // Create indexes
    console.log("🔄 İndeksler oluşturuluyor...")

    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id)",
      "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
      "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)",
      "CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)",
      "CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category)",
      "CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)",
      "CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id)",
      "CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales(date)",
      "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
      "CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active)",
    ]

    for (const indexSQL of indexes) {
      try {
        await connection.execute(indexSQL)
      } catch (error) {
        // Ignore "already exists" errors for indexes
        if (!error.message.includes("already exists")) {
          console.log(`⚠️  İndeks uyarısı: ${error.message}`)
        }
      }
    }
    console.log("   ✅ İndeksler oluşturuldu")

    // Verify installation
    const [tables_result] = await connection.execute("SHOW TABLES")
    console.log(`✅ ${tables_result.length} tablo oluşturuldu:`)
    tables_result.forEach((table) => {
      console.log(`   - ${Object.values(table)[0]}`)
    })

    // Show data counts
    const [userCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [tableCount] = await connection.execute("SELECT COUNT(*) as count FROM restaurant_tables")
    const [menuCount] = await connection.execute("SELECT COUNT(*) as count FROM menu_items")

    console.log("\n📊 Eklenen veriler:")
    console.log(`   - ${userCount[0].count} kullanıcı`)
    console.log(`   - ${tableCount[0].count} masa`)
    console.log(`   - ${menuCount[0].count} menü öğesi`)

    console.log("\n🎉 Veritabanı kurulumu başarıyla tamamlandı!")
    console.log("\n📋 Demo hesap bilgileri:")
    console.log("   Admin: admin / admin123")
    console.log("   Müdür: mehmet / 123456")
    console.log("   Kasiyer: ayse / 123456")
    console.log("   Garson: ahmet / 123456")
    console.log("\n🚀 Uygulamayı başlatmak için: npm run dev")
  } catch (error) {
    console.error("❌ Veritabanı kurulumu sırasında hata:", error.message)

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Çözüm önerileri:")
      console.log("   1. XAMPP/WAMP/MAMP çalıştığından emin olun")
      console.log("   2. MySQL servisi aktif olduğunu kontrol edin")
      console.log("   3. Bağlantı bilgilerini .env.local dosyasında kontrol edin")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.log("\n💡 Çözüm önerileri:")
      console.log("   1. Kullanıcı adı ve şifre doğru olduğundan emin olun")
      console.log("   2. MySQL kullanıcısının gerekli yetkilere sahip olduğunu kontrol edin")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// Run the setup
setupDatabase()
