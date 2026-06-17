import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schemas/index.js";

export async function createDatabase(
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
) {
  const pool = new Pool({
    host,
    port,
    user,
    password,
    database,

    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  await pool.query("SELECT 1");

  const db = drizzle<typeof schema>(pool, {
    schema,
    casing: "snake_case",
  });

  return { db, pool };
}
