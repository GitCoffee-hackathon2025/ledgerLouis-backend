// ├── queue.ts "Como falar com a BullMQ?"
// ├── worker.ts "Como iniciar um Worker?"
// ├── producer.ts "Quais jobs minha aplicação consegue criar?
// └── processor.ts "Como cada job é processado?"

// | Arquivo   | Conhece                 |
// | --------- | ----------------------- |
// | Producer  | Queue                   |
// | Queue     | BullMQ                  |
// | Worker    | Processor               |
// | Processor | Repositórios e Services |

import type { RedisClientType } from "redis";
import type { IRedisClient, Worker } from "bullmq";
import { createWorkerConnection } from "./connection.js";
import { attachWorkerEvents } from "./worker.events.js";
import { createDatabaseService } from "../database/index.js";
import type { DB } from "../../types/db.js";

// Modules
import { buildCompanyWorkers } from "../../modules/companies/queue/workers.js";
import { buildFinanceWorkers } from "../../modules/finances/queue/workers.js";

export interface WorkerDeps {
  adapter: IRedisClient;
  db: DB;
}

type WorkerBuilder = (
  deps: WorkerDeps,
) => Record<string, Worker> | Promise<Record<string, Worker>>;

// Centralizador dos workers dos modulos
const builds: Record<string, WorkerBuilder> = {
  companies: buildCompanyWorkers,
  finances: buildFinanceWorkers,
};

export interface WorkerContext {
  workers: Worker[];
  adapter: RedisClientType;
  closeDb: () => Promise<void>;
}

// Funções que gerenciam o ciclo de vida do service worker externo (pos-redis)
export async function registerWorkers(): Promise<WorkerContext> {
  const { raw, adapter } = await createWorkerConnection();
  const { db, close: closeDb } = await createDatabaseService(
    process.env.DATABASE_URL!,
  );

  const workers: Worker[] = [];

  for (const [moduleName, build] of Object.entries(builds))
    for (const [workerName, worker] of Object.entries(await build({ adapter, db }))) {
      attachWorkerEvents(moduleName + "." + workerName, worker);
      workers.push(worker);
    }

  return { workers, adapter: raw, closeDb };
}

export async function closeWorkers({ workers, adapter, closeDb }: WorkerContext) {
  await Promise.all(workers.map((worker) => worker.close()));
  await adapter.quit();
  await closeDb();
}
