-- Activity logs table (idempotent)
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

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_logs (created_at);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs (type);
