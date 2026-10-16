CREATE TABLE rsvps (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  attending TEXT NOT NULL CHECK (attending IN ('yes', 'no')),
  guests INTEGER NOT NULL DEFAULT 0 CHECK (guests >= 0 AND guests <= 10),
  shuttle BOOLEAN NOT NULL DEFAULT FALSE,
  events TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  arrival TEXT NOT NULL DEFAULT '',
  dietary TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX rsvps_received_at_idx ON rsvps (received_at DESC);

CREATE TABLE site_visits (
  event_id UUID PRIMARY KEY,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX site_visits_visited_at_idx ON site_visits (visited_at DESC);
