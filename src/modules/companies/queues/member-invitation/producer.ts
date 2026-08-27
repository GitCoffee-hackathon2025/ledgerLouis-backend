import type { Queue } from "bullmq";

import type { MemberInvitationJob } from "./types/job.js";

export function createMemberInvitationProducer(
  jobName: string,
  queue: Queue<MemberInvitationJob>,
) {
  return {
    async enqueue(data: MemberInvitationJob) {
      await queue.add(jobName, data, {
        removeOnComplete: true,
        removeOnFail: {
          age: 7 * 24 * 60 * 60, // 7 dias
          count: 1000,
        },
      });
    },
  };
}
