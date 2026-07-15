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

// Modules
import { buildCompanyWorkers } from "../../modules/companies/queue/workers.js";

type WorkerBuilder = (connection: IRedisClient) => Record<string, Worker>;

// Centralizador dos workers dos modulos
const builds: Record<string, WorkerBuilder> = {
  companies: buildCompanyWorkers,
};

export interface WorkerContext {
  workers: Worker[];
  connection: RedisClientType;
}

// Funções que gerenciam o ciclo de vida do service worker externo (pos-redis)
export async function registerWorkers(): Promise<WorkerContext> {
  const { raw, connection } = await createWorkerConnection();

  const workers: Worker[] = [];

  for (const [moduleName, build] of Object.entries(builds))
    for (const [workerName, worker] of Object.entries(build(connection))) {
      attachWorkerEvents(moduleName + "." + workerName, worker);
      workers.push(worker);
    }

  return { workers, connection: raw };
}

export async function closeWorkers({ workers, connection }: WorkerContext) {
  await Promise.all(workers.map((worker) => worker.close()));
  await connection.quit();
}
