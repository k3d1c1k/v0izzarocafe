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

async function migrateDatabase() {
  let connection

  try {
    console.log("🔄 Veritabanı migrasyonu başlatılıyor...")

    connection = await mysql.createConnection(dbConfig)
    console.log("✅ Veritabanına bağlanıldı")

    // Create migrations table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Check for migration files
    const migrationsDir = path.join(__dirname, "migrations")

    try {
      const files = await fs.readdir(migrationsDir)
      const migrationFiles = files.filter((file) => file.endsWith(".sql")).sort()

      if (migrationFiles.length === 0) {
        console.log("📝 Çalıştırılacak migrasyon bulunamadı")
        return
      }

      for (const file of migrationFiles) {
        // Check if migration already executed
        const [existing] = await connection.execute("SELECT id FROM migrations WHERE filename = ?", [file])

        if (existing.length > 0) {
          console.log(`⏭️  ${file} zaten çalıştırılmış, atlanıyor`)
          continue
        }

        // Read and execute migration
        const migrationPath = path.join(migrationsDir, file)
        const migrationSQL = await fs.readFile(migrationPath, "utf8")

        const commands = migrationSQL
          .split(";")
          .map((cmd) => cmd.trim())
          .filter((cmd) => cmd.length > 0 && !cmd.startsWith("--"))

        await connection.beginTransaction()

        try {
          for (const command of commands) {
            if (command.trim()) {
              await connection.execute(command)
            }
          }

          // Mark migration as executed
          await connection.execute("INSERT INTO migrations (filename) VALUES (?)", [file])

          await connection.commit()
          console.log(`✅ ${file} başarıyla çalıştırıldı`)
        } catch (error) {
          await connection.rollback()
          throw error
        }
      }
    } catch (error) {
      if (error.code === "ENOENT") {
        console.log("📁 Migrations klasörü bulunamadı, oluşturuluyor...")
        await fs.mkdir(migrationsDir, { recursive: true })

        // Create example migration
        const exampleMigration = `-- Example migration file
-- Filename: 001_add_example_column.sql

-- ALTER TABLE users ADD COLUMN example_column VARCHAR(255);
-- UPDATE users SET example_column = 'default_value';

-- Remember to:
-- 1. Name files with incremental numbers: 001_, 002_, etc.
-- 2. Use descriptive names
-- 3. Test migrations before running in production
`

        await fs.writeFile(path.join(migrationsDir, "001_example_migration.sql"), exampleMigration)

        console.log("📝 Örnek migrasyon dosyası oluşturuldu: migrations/001_example_migration.sql")
      } else {
        throw error
      }
    }

    console.log("🎉 Migrasyon işlemi tamamlandı!")
  } catch (error) {
    console.error("❌ Migrasyon sırasında hata:", error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

migrateDatabase()
