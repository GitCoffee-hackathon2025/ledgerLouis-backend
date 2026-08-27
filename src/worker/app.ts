import { createWorkerConnection } from "../infrastructure/queue/connection.js";
import { registerWorkers } from "../infrastructure/queue/worker.runtime.js";
import { registerSchedulers } from "../infrastructure/queue/scheduler.runtime.js";

import { builds, schedulers } from "./loader.js";
import { buildWorkerInfrastructure } from "./plugins/index.js";

export async function buildServiceWorker() {
  const { config, close: closeInfrastructure } = await buildWorkerInfrastructure();

  const redis = await createWorkerConnection();
  const context = await registerWorkers(redis, builds, config);

  await registerSchedulers(redis.adapter, schedulers);

  return {
    context,
    closeInfrastructure,
  };
}
