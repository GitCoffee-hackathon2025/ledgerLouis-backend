import { createWorkerConnection } from "../infrastructure/queue/connection.js";
import { registerWorkers } from "../infrastructure/queue/runtime.js";

import { builds } from "./loader.js";
import { createDatabase } from "./plugins/db.js";
import { createStorage } from "./plugins/storage.js";

export async function buildServiceWorker() {
  const { db, close: closeDatabase } = await createDatabase();

  const config = {
    db,
    storages: createStorage(),
  };

  const redis = await createWorkerConnection();
  const context = await registerWorkers(redis, builds, config);

  return {
    context,
    closeDatabase,
  };
}
