const mysql = require("mysql2/promise")

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
}

const dbName = process.env.DB_NAME || "restaurant_pos"

async function resetDatabase() {
  let connection

  try {
    console.log("🔄 Veritabanı sıfırlanıyor...")

    connection = await mysql.createConnection(dbConfig)
    console.log("✅ MySQL sunucusuna bağlanıldı")

    // Drop database if exists
    await connection.execute(`DROP DATABASE IF EXISTS \`${dbName}\``)
    console.log(`✅ Veritabanı '${dbName}' silindi`)

    console.log("🎉 Veritabanı başarıyla sıfırlandı!")
    console.log("💡 Yeniden kurmak için: npm run db:setup")
  } catch (error) {
    console.error("❌ Veritabanı sıfırlama sırasında hata:", error.message)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

resetDatabase()
