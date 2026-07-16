import { Queue, type IRedisClient } from "bullmq";

export const INVITE_QUEUE_NAME = "company-invite";

export function createInviteQueue(name: string, connection: IRedisClient) {
  return new Queue(name, { connection });
}
