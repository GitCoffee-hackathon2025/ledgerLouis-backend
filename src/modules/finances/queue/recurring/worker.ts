import { Worker, type IRedisClient } from "bullmq";
import type { createRecurringProcessor } from "./processor.js";

export function createRecurringWorker(
  name: string,
  connection: IRedisClient,
  processor: ReturnType<typeof createRecurringProcessor>,
) {
  return new Worker(name, processor, { connection });
}
