import { Worker, type IRedisClient } from "bullmq";
import type { createInviteProcessor } from "./processor.js";

export function createInviteWorker(
  name: string,
  connection: IRedisClient,
  processor: ReturnType<typeof createInviteProcessor>,
) {
  return new Worker(name, processor, { connection });
}
