import type { ULID } from "../../../../../domain/shared/id.js";

export interface MemberInvitationJob {
  invitationId: ULID;
  invitationUrl: string;
}
