import { env } from "../lib/env";
import { makeLogger } from "../lib/logger";
import Database from "better-sqlite3";
import type { Database as DatabaseType } from "better-sqlite3";

export const db = new Database(env.DATABASE_URL, {
  verbose: (message: unknown) => makeLogger().info(`${message}`),
}) as DatabaseType;

export type DB = DatabaseType;

export default db;
