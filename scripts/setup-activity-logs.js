const mysql = require("mysql2/promise")

async function main() {
const host = process.env.DB_HOST || "127.0.0.1"
const user = process.env.DB_USER || "root"
const password = process.env.DB_PASSWORD || ""
const database = process.env.DB_NAME || "restaurant_pos"
const port = Number(process.env.DB_PORT || 3306)

let connection
try {
  connection = await mysql.createConnection({ host, user, password, database, port })
  console.log("Connected to MySQL:", { host, database })

  const createSql = `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id            VARCHAR(64)  NOT NULL PRIMARY KEY,
      type          VARCHAR(64)  NOT NULL,
      description   TEXT         NOT NULL,
      user_id       VARCHAR(64)  NULL,
      user_name     VARCHAR(191) NULL,
      table_id      VARCHAR(64)  NULL,
      table_number  VARCHAR(64)  NULL,
      order_id      VARCHAR(64)  NULL,
      amount        DECIMAL(10,2) NULL,
      details       JSON         NULL,
      created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `
  await connection.query(createSql)

  // Index oluşturma (MySQL 8.0+ 'IF NOT EXISTS' destekli; eski sürümde hata verirse try-catch ile yutuyoruz)
  try { await connection.query("CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs (created_at)") } catch {}
  try { await connection.query("CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs (type)") } catch {}

  console.log("activity_logs table is ready.")
} catch (err) {
  console.error("setup-activity-logs failed:", err && err.message ? err.message : err)
  process.exitCode = 1
} finally {
  if (connection) await connection.end()
}
}

// Çalıştır
if (require.main === module) {
main()
}

module.exports = { main }
