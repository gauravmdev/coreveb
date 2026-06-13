import "server-only";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";
import { ensureSeed } from "./seed";

type DbClient = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  __corevebDb?: DbClient;
};

function createDb(): DbClient {
  const file = process.env.DATABASE_PATH ?? "./data/coreveb.db";
  const abs = path.resolve(process.cwd(), file);
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  const sqlite = new Database(abs);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: path.resolve(process.cwd(), "drizzle") });
  ensureSeed(db);
  return db;
}

export const db: DbClient = globalForDb.__corevebDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__corevebDb = db;

export { schema };
export * from "./schema";
