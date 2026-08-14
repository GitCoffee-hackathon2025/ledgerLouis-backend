import type { RedisClientType } from "redis";
import type { IRedisClient, Worker } from "bullmq";
import { attachWorkerEvents } from "./worker.events.js";

type WorkerBuilder<TConfig> = (
  connection: IRedisClient,
  config: TConfig,
) => Worker;

export type Builds<TConfig> = Record<
  string,
  () => Record<string, WorkerBuilder<TConfig>>
>;

export interface WorkerContext {
  workers: Worker[];
  adapter: RedisClientType;
}

// Funções que gerenciam o ciclo de vida do service worker externo (pos-redis)
export async function registerWorkers<TConfig>(
  redis: { raw: RedisClientType; adapter: IRedisClient },
  builds: Builds<TConfig>,
  config: TConfig,
): Promise<WorkerContext> {
  const workers: Worker[] = [];

  for (const [moduleName, build] of Object.entries(builds)) {
    const workerBuilders = build();

    for (const [workerName, workerBuilder] of Object.entries(workerBuilders)) {
      const worker = workerBuilder(redis.adapter, config);

      attachWorkerEvents(`${moduleName}.${workerName}`, worker);
      workers.push(worker);
    }
  }

  return { workers, adapter: redis.raw };
}

export async function closeWorkers({ workers, adapter }: WorkerContext) {
  await Promise.all(workers.map((worker) => worker.close()));
  await adapter.quit();
}
