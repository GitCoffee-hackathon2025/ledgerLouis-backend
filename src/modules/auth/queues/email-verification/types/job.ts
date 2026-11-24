import type { ULID } from "../../../../../domain/shared/id.js";

export interface EmailVerificationJob {
  userId: ULID;
  verificationUrl: string;
}
