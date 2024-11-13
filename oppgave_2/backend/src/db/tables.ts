import type { DB } from "./db";

// her har jeg brukt claude.ai til å generere sql basert på ønsket datastruktur
export const createTables = async (db: DB) => {
  db.exec(`
    DROP TABLE IF EXISTS bookings;
    DROP TABLE IF EXISTS events;
    DROP TABLE IF EXISTS templates;
    DROP TABLE IF EXISTS types;
  `);

  db.exec(`
    CREATE TABLE types (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE templates (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      allowed_days TEXT NOT NULL,
      max_capacity INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      is_private BOOLEAN NOT NULL,
      allow_waitlist BOOLEAN NOT NULL,
      allow_same_day BOOLEAN NOT NULL,
      created_at DATETIME NOT NULL
    );

    CREATE TABLE events (
      id INTEGER PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description_short TEXT NOT NULL,
      description_long TEXT NOT NULL,
      date DATETIME NOT NULL,
      location TEXT NOT NULL,
      type_id INTEGER NOT NULL,
      capacity INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      template_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      waitlist TEXT,
      FOREIGN KEY (template_id) REFERENCES templates(id),
      FOREIGN KEY (type_id) REFERENCES types(id)
    );

    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY,
      event_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      has_paid BOOLEAN NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      FOREIGN KEY (event_id) REFERENCES events(id)
    );
  `);
};
