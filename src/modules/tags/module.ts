import type { DB } from "../../types/db.js";

import { createTagRepository } from "./repositories/tag.repository.js";
import { createTransactionTagRepository } from "./repositories/transactionTag.repository.js";
import { createTagService } from "./services/tag.service.js";
import { createTransactionTagService } from "./services/transactionTag.service.js";
import { createMemberService } from "../companies/services/member.service.js";
import { createMemberRepository } from "../companies/repositories/member.repository.js";
import { createUserRepository } from "../users/repositories/user.repository.js";
import { createTransactionRepository } from "../finances/repositories/transaction.repository.js";

export function buildTagModule(db: DB) {
  const tagRepo = createTagRepository(db);
  const transactionTagRepo = createTransactionTagRepository(db);
  const transactionRepo = createTransactionRepository(db);
  const memberRepo = createMemberRepository(db);
  const userRepo = createUserRepository(db);

  const memberService = createMemberService(memberRepo, userRepo);
  const tagService = createTagService(tagRepo, memberService);
  const transactionTagService = createTransactionTagService(
    transactionTagRepo,
    tagRepo,
    transactionRepo,
    memberService,
  );

  return { tagService, transactionTagService };
}
