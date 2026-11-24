import type { Queue } from "bullmq";

import type { EmailVerificationJob } from "./types/job.js";

export function createEmailVerificationProducer(
  jobName: string,
  queue: Queue<EmailVerificationJob>,
) {
  return {
    async enqueue(data: EmailVerificationJob) {
      await queue.add(jobName, data, {
        removeOnComplete: true,
        removeOnFail: { age: 7 * 24 * 60 * 60, count: 1000 },
      });
    },
  };
}
