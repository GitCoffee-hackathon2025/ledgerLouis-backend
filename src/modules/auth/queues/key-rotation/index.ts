import { Queue, Worker, type IRedisClient } from "bullmq";

import { registerKeyRotationScheduler } from "./scheduler.js";
import { createKeyRotationProcessor } from "./processor.js";

export const KEY_ROTATION_QUEUE_NAME = "key-rotation";
export const KEY_ROTATION_JOB_NAME = "rotate-keys";
export const KEY_ROTATION_SCHEDULER_ID = "keys:rotation";

export async function buildKeyRotationScheduler(connection: IRedisClient) {
  const queue = new Queue(KEY_ROTATION_QUEUE_NAME, {
    connection,
  });

  try {
    registerKeyRotationScheduler(
      { idName: KEY_ROTATION_SCHEDULER_ID, jobName: KEY_ROTATION_JOB_NAME },
      queue,
    );
  } finally {
    await queue.close();
  }
}

export function buildKeyRotationWorker(
  connection: IRedisClient,
  config: Parameters<typeof createKeyRotationProcessor>[0],
) {
  return new Worker(
    KEY_ROTATION_QUEUE_NAME,
    createKeyRotationProcessor(config),
    { connection },
  );
}
