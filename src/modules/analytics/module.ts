import type { DB } from "../../types/db.js";

import { createAnalyticsRepository } from "./repositories/analytics.repository.js";
import { createAnalyticsService } from "./services/analytics.service.js";
import { createTagRepository } from "../tags/repositories/tag.repository.js";
import { createMemberService } from "../companies/services/member.service.js";
import { createMemberRepository } from "../companies/repositories/member.repository.js";
import { createUserRepository } from "../users/repositories/user.repository.js";

export function buildAnalyticsModule(db: DB) {
  const analyticsRepo = createAnalyticsRepository(db);
  const tagRepo = createTagRepository(db);
  const memberRepo = createMemberRepository(db);
  const userRepo = createUserRepository(db);

  const memberService = createMemberService(memberRepo, userRepo);
  const analyticsService = createAnalyticsService(analyticsRepo, tagRepo, memberService);

  return { analyticsService };
}
