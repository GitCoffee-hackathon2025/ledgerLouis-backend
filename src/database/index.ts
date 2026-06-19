import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schemas/index.js";

export async function createDatabase() {
  const connectionString = process.env.DB_URL;

  if (!connectionString) {
    throw new Error("DB_URL não definida no ambiente");
  }

  const pool = new Pool({
    connectionString,

    max: 10,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });

  await pool.query("SELECT 1");

  const db = drizzle(pool, {
    schema,
    casing: "snake_case",
  });

  return { db, pool };
}