import { createPool } from "mysql2";
import { drizzle } from "drizzle-orm/mysql2";

import * as schema from "./schemas/index.js";

export async function createDatabase(
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
) {
  const pool = createPool({
    host,
    port,
    user,
    password,
    database,

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    connectTimeout: 10000,
    enableKeepAlive: true,
    timezone: "Z",
    charset: "utf8mb4",
  });

  await pool.promise().query("SELECT 1");

  const db = drizzle<typeof schema>(pool, {
    schema,
    casing: "snake_case",
    mode: "default",
  });

  return { db, pool };
}
