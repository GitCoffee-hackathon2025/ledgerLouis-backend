import type { FastifyInstance } from "fastify";

import { createCompanyRepository } from "./repositories/company.repository.js";
import { createMemberRepository } from "./repositories/member.repository.js";
import { createCompanyService } from "./services/company.service.js";
import { createMemberService } from "./services/member.service.js";
import { createUserRepository } from "../users/repository.js";

export function buildCompanyModule(app: FastifyInstance) {
  const userRepo = createUserRepository(app.db);
  const companyRepo = createCompanyRepository(app.db);
  const memberRepo = createMemberRepository(app.db);

  const memberService = createMemberService(memberRepo, userRepo);
  const companyService = createCompanyService(
    companyRepo,
    memberRepo,
    memberService,
  );

  return companyService;
}
