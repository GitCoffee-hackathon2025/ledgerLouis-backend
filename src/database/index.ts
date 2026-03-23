import { createPool } from "mysql2/promise";
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

  await pool.query("SELECT 1");

  const db = drizzle(pool, {
    schema: schema as any,
    casing: "snake_case",
  });

  return db;
}
