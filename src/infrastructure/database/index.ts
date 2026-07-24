import { createDatabase } from "./factory.js";

export async function createDatabaseService(connectionString: string) {
  const { db, pool } = await createDatabase(connectionString);

  return { db, close: async () => pool.end() };
}
