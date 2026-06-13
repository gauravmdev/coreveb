/**
 * Applies Drizzle migrations and seeds demo data. Run via `bun run db:migrate`
 * (locally and in the Docker entrypoint before the app starts).
 */
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as schema from "../src/db/schema";
import { ensureSeed } from "../src/db/seed";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new Pool({ connectionString: url });
const db = drizzle(pool, { schema });

await migrate(db, { migrationsFolder: "drizzle" });
await ensureSeed(db);
await pool.end();

console.log("✓ migrated + seeded");
