import type { DB } from "./db";

// her har jeg brukt claude.ai til å generere sql basert på eksisterende datastruktur
export const createTables = async (db: DB) => {
  db.exec(`
    CREATE TABLE users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE lessons (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      pre_amble TEXT NOT NULL,
      order_number INTEGER,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );

    CREATE TABLE lesson_text (
      id TEXT PRIMARY KEY,
      lesson_id TEXT NOT NULL,
      text TEXT NOT NULL,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );

    CREATE TABLE comments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      comment TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
    );
  `);
};
