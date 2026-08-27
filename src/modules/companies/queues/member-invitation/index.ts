import { Queue, Worker, type IRedisClient } from "bullmq";

import { createMemberInvitationProducer } from "./producer.js";
import { createMemberInvitationProcessor } from "./processor.js";

export const MEMBER_INVITATION_QUEUE_NAME = "member-invitation";
export const MEMBER_INVITATION_JOB_NAME = "send-member-invitation";

export function buildMemberInvitationQueue(connection: IRedisClient) {
  return createMemberInvitationProducer(
    MEMBER_INVITATION_JOB_NAME,
    new Queue(MEMBER_INVITATION_QUEUE_NAME, {
      connection,
    }),
  );
}

export function buildMemberInvitationWorker(
  connection: IRedisClient,
  config: Parameters<typeof createMemberInvitationProcessor>[0],
) {
  return new Worker(
    MEMBER_INVITATION_QUEUE_NAME,
    createMemberInvitationProcessor(config),
    {
      connection,
    },
  );
}
