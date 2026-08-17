import { createWorkerConnection } from "../infrastructure/queue/connection.js";
import { registerWorkers } from "../infrastructure/queue/worker.runtime.js";
import { registerSchedulers } from "../infrastructure/queue/scheduler.runtime.js";

import { builds, schedulers } from "./loader.js";
import { createDatabase } from "./plugins/db.js";
import { createStorage } from "./plugins/storage.js";

export async function buildServiceWorker() {
  // Conexão com o banco
  const { db, close: closeDatabase } = await createDatabase();

  // Tecnologias usadas pelos workers
  const config = {
    db,
    storages: createStorage(),
  };

  const redis = await createWorkerConnection();
  const context = await registerWorkers(redis, builds, config);

  await registerSchedulers(redis.adapter, schedulers);

  return {
    context,
    closeDatabase,
  };
}
