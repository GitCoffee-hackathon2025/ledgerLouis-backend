import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "../../database/schemas/index.js";

export async function createDatabase(connectionString: string) {
  const pool = new Pool({
    connectionString,
    max: 10, // equivalente a connectionLimit
    connectionTimeoutMillis: 10000, // equivalente a connectTimeout
    keepAlive: true, // equivalente a enableKeepAlive
    idleTimeoutMillis: 30000, // sem equivalente direto no original, mas evita conexões zumbi no pool
  });

  const client = await pool.connect();
  await client.query("SELECT 1");
  client.release();

  const db = drizzle(pool, {
    schema,
    casing: "snake_case",
  });

  return { db, pool };
}
