import { Queue, type IRedisClient } from "bullmq";

export const RECURRING_QUEUE_NAME = "recurring-transactions";

export function createRecurringQueue(name: string, connection: IRedisClient) {
  return new Queue(name, { connection });
}
