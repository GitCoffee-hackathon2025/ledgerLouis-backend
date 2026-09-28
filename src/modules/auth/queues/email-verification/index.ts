import { Queue, Worker, type IRedisClient } from "bullmq";

import { createEmailVerificationProducer } from "./producer.js";
import { createEmailVerificationProcessor } from "./processor.js";

export const EMAIL_VERIFICATION_QUEUE_NAME = "email-verification";
export const EMAIL_VERIFICATION_JOB_NAME = "send-email-verification";

export function buildEmailVerificationQueue(connection: IRedisClient) {
  return createEmailVerificationProducer(
    EMAIL_VERIFICATION_JOB_NAME,
    new Queue(EMAIL_VERIFICATION_QUEUE_NAME, { connection }),
  );
}

export function buildEmailVerificationWorker(
  connection: IRedisClient,
  config: Parameters<typeof createEmailVerificationProcessor>[0],
) {
  return new Worker(
    EMAIL_VERIFICATION_QUEUE_NAME,
    createEmailVerificationProcessor(config),
    { connection },
  );
}
