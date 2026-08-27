import { buildMemberInvitationWorker } from "./member-invitation/index.js";

export const companyWorkers = {
  memberInvitation: buildMemberInvitationWorker,
};
