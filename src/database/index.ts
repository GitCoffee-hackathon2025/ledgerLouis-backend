import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schemas/index.js";

export async function createDatabase(connectionString: string) {


  // Código limpo padrão do pg, ideal para o Session Pooler
  const pool = new Pool({
    connectionString,
    max: 10,
  });

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("🚀 Conectou via Session Pooler!");
  } catch (error) {
    console.error("Erro no Session Pooler:", error);
    throw error;
  }

  const db = drizzle(pool, {
    schema,
    casing: "snake_case",
  });

  return { db, pool };
}