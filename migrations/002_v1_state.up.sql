-- Successful responses are committed atomically with their orders. Keep them
-- indefinitely, exceeding the contract's minimum 24-hour retention period.
CREATE TABLE v1_idempotency (
  key           TEXT PRIMARY KEY NOT NULL,
  fingerprint   TEXT NOT NULL,
  response_body TEXT NOT NULL,
  location      TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

-- Random tokens are opaque, filter-bound, durable and never expire. The upper
-- bound freezes the first page; last_id advances through that same snapshot.
CREATE TABLE v1_cursors (
  token      TEXT PRIMARY KEY NOT NULL,
  table_id   INTEGER CHECK (table_id BETWEEN 1 AND 200),
  upper_id   INTEGER NOT NULL,
  last_id    INTEGER NOT NULL,
  created_at TEXT NOT NULL
);
