import type { IRedisClient } from "bullmq";

import { createInviteQueue } from "./queue.js";
import { createInviteProducer } from "./producer.js";

import { createInviteWorker } from "./worker.js";
import { createInviteProcessor } from "./processor.js";

const inviteQueueName = "company-invite";

export function buildInviteProducer(connection: IRedisClient) {
  return createInviteProducer(createInviteQueue(inviteQueueName, connection));
}

export function buildInviteWorker(connection: IRedisClient) {
  return createInviteWorker(
    inviteQueueName,
    connection,
    createInviteProcessor(),
  );
}
