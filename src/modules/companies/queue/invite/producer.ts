import type { Queue } from "bullmq";
import type { ULID } from "../../../../domain/shared/id.js";

export function createInviteProducer(queue: Queue) {
  return {
    send(inviteId: ULID) {
      return queue.add("send-email", { inviteId });
    },
  };
}
