import type { DB } from "../../types/db.js";
import type { Redis } from "../../types/redis.js";

import { createCompanyRepository } from "./repositories/company.repository.js";
import { createCompanyService } from "./services/company.service.js";
import { createCompanyUpdateService } from "./services/company.update.service.js";

import { createMemberRepository } from "./repositories/member.repository.js";
import { createMemberService } from "./services/member.service.js";

import { createInviteRepository } from "./repositories/invite.repository.js";
import { createInvitationService } from "./services/invitation.service.js";

import { createAccountRepository } from "../finances/repositories/account.repository.js";
import { createAccountService } from "../finances/services/account.service.js";

import { createUserRepository } from "../users/repositories/user.repository.js";

// TEMPORARIO
import { buildMemberInvitationQueue } from "./queues/member-invitation/index.js";

export function buildCompanyModule(db: DB, redis: Redis["adapter"]) {
  const userRepo = createUserRepository(db);

  const companyRepo = createCompanyRepository(db);
  const memberRepo = createMemberRepository(db);

  const memberService = createMemberService(memberRepo, userRepo);

  const companyService = createCompanyService(
    companyRepo,
    memberRepo,
    memberService,
    createAccountService(createAccountRepository(db)),
  );
  const companyUpdateService = createCompanyUpdateService(
    companyRepo,
    memberService,
  );

  const invitationService = createInvitationService(
    createInviteRepository(db),
    memberRepo,
    userRepo,
    buildMemberInvitationQueue(redis),
    memberService.assertRole,
  );

  return {
    company: { companyService, companyUpdateService },
    memberService,
    invitationService,
  };
}
