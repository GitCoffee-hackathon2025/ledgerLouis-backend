import { Queue, Worker, type IRedisClient } from "bullmq";

import { registerRecurringScheduler } from "./scheduler.js";
import { createRecurringProcessor } from "./processor.js";

export const RECURRING_QUEUE_NAME = "recurring-transactions";
export const RECURRING_JOB_NAME = "materialize-due";
export const RECURRING_SCHEDULER_ID = "finances:recurring";

export async function buildRecurringScheduler(connection: IRedisClient) {
  const queue = new Queue(RECURRING_QUEUE_NAME, { connection });

  try {
    await registerRecurringScheduler(
      { idName: RECURRING_SCHEDULER_ID, jobName: RECURRING_JOB_NAME },
      queue,
    );
  } finally {
    await queue.close();
  }
}

export function buildRecurringWorker(
  connection: IRedisClient,
  config: Parameters<typeof createRecurringProcessor>[0],
) {
  return new Worker(RECURRING_QUEUE_NAME, createRecurringProcessor(config), {
    connection,
  });
}
