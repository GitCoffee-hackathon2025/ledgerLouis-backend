import { Queue, Worker, type IRedisClient } from "bullmq";

import { registerFileCleanupScheduler } from "./scheduler.js";
import { createFileCleanupProcessor } from "./processor.js";

export const FILE_CLEANUP_QUEUE_NAME = "file-cleanup";
export const FILE_CLEANUP_JOB_NAME = "cleanup-files";
export const FILE_CLEANUP_SCHEDULER_ID = "files:cleanup";

export function buildFileCleanupProducer(connection: IRedisClient) {
  const queue = new Queue(FILE_CLEANUP_QUEUE_NAME, {
    connection,
  });

  return registerFileCleanupScheduler(
    { idName: FILE_CLEANUP_SCHEDULER_ID, jobName: FILE_CLEANUP_JOB_NAME },
    queue,
  );
}

export function buildFileCleanupWorker(
  connection: IRedisClient,
  config: Parameters<typeof createFileCleanupProcessor>[0],
) {
  return new Worker(
    FILE_CLEANUP_QUEUE_NAME,
    createFileCleanupProcessor(config),
    { connection },
  );
}
