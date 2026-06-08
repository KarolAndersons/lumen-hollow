-- Lumen Hollow, Database schema
-- All identifiers use British English spellings throughout.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS habitats (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  tagline           TEXT NOT NULL,
  description       TEXT NOT NULL,
  accent_colour     TEXT NOT NULL,
  map_x             REAL NOT NULL,
  map_y             REAL NOT NULL,
  display_order     INTEGER NOT NULL DEFAULT 0,
  is_featured       INTEGER NOT NULL DEFAULT 0,
  image_filename    TEXT,
  image_alt         TEXT,
  image_credit      TEXT,
  image_source_url  TEXT
);

CREATE TABLE IF NOT EXISTS exhibits (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  habitat_id         INTEGER NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  kind               TEXT NOT NULL CHECK (kind IN ('exhibit', 'experience', 'demonstration')),
  species_common     TEXT,
  species_scientific TEXT,
  iucn_status        TEXT,
  description        TEXT NOT NULL,
  image_filename     TEXT,
  image_alt          TEXT,
  image_credit       TEXT,
  image_source_url   TEXT,
  FOREIGN KEY (habitat_id) REFERENCES habitats(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event_categories (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  slug  TEXT NOT NULL UNIQUE,
  name  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  summary       TEXT NOT NULL,
  description   TEXT NOT NULL,
  start_date    TEXT NOT NULL,
  end_date      TEXT NOT NULL,
  category_id   INTEGER NOT NULL,
  habitat_id    INTEGER,
  FOREIGN KEY (category_id) REFERENCES event_categories(id),
  FOREIGN KEY (habitat_id) REFERENCES habitats(id)
);

CREATE TABLE IF NOT EXISTS contacts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  subject      TEXT NOT NULL,
  message      TEXT NOT NULL,
  submitted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exhibits_habitat ON exhibits(habitat_id);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id);
