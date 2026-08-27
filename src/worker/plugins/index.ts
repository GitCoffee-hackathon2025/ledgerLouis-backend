import createDatabase from "./db.js";
import createStorage from "./storage.js";
import createEmail from "./email.js";

export async function buildWorkerInfrastructure() {
  const { db, close: closeDatabase } = await createDatabase();

  return {
    /**
     * Objeto com as tecnológias usadas pelos background workers
     */
    config: {
      db,
      email: await createEmail(),
      storages: await createStorage(),
    },
    /**
     * Tormar cuidado na ordem de fechamento das tecnológias
     */
    async close() {
      await closeDatabase();
    },
  };
}
