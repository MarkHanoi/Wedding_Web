CREATE TABLE IF NOT EXISTS rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no')),
  guests INTEGER NOT NULL DEFAULT 0 CHECK (guests >= 0 AND guests <= 10),
  shuttle INTEGER NOT NULL DEFAULT 0 CHECK (shuttle IN (0, 1)),
  events_json TEXT NOT NULL DEFAULT '[]',
  arrival TEXT NOT NULL DEFAULT '',
  transport_email TEXT NOT NULL DEFAULT '',
  dietary TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  received_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS rsvps_received_at_idx ON rsvps (received_at DESC);

CREATE TABLE IF NOT EXISTS site_visits (
  event_id TEXT PRIMARY KEY,
  visited_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS site_visits_visited_at_idx ON site_visits (visited_at DESC);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip_hash TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  reset_at INTEGER NOT NULL
);
