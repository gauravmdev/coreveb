import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { __corevebPool?: Pool };

const pool =
  globalForDb.__corevebPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") globalForDb.__corevebPool = pool;

export const db = drizzle(pool, { schema });

export { pool, schema };
export * from "./schema";
