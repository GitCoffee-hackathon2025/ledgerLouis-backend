import type { Job } from "bullmq";
import type { ULID } from "../../../../domain/shared/id.js";

export function createInviteProcessor() {
  // inviteRepo,
  // emailService,
  return async (job: Job<{ inviteId: ULID }>) => {};
}
