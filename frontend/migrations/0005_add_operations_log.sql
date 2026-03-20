-- Adds operations log table for server activity visibility.
CREATE TABLE IF NOT EXISTS operations_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  op_name TEXT NOT NULL,
  actor_type TEXT,
  actor TEXT,
  target TEXT,
  details TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
