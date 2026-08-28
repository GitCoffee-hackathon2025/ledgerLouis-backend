import { generateId, type ULID } from "../../../domain/shared/id.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import type { createTransactionTagRepository } from "../repositories/transactionTag.repository.js";
import type { createTagRepository } from "../repositories/tag.repository.js";
import type { createTransactionRepository } from "../../finances/repositories/transaction.repository.js";
import type { createMemberService } from "../../companies/services/member.service.js";

export const createTransactionTagService = (
  linkRepo: ReturnType<typeof createTransactionTagRepository>,
  tagRepo: ReturnType<typeof createTagRepository>,
  transactionRepo: ReturnType<typeof createTransactionRepository>,
  memberService: ReturnType<typeof createMemberService>,
) => {
  async function assertTransactionInCompany(
    companyId: ULID,
    transactionId: ULID,
  ) {
    const transaction = await transactionRepo.findById(transactionId);
    if (!transaction || transaction.companyId !== companyId)
      throw new AppError("TRANSACTION_NOT_FOUND");

    return transaction;
  }

  return {
    async list(companyId: ULID, userId: ULID, transactionId: ULID) {
      await memberService.assertRole(companyId, userId);
      await assertTransactionInCompany(companyId, transactionId);

      return linkRepo.listByTransaction(transactionId);
    },

    async attach(
      companyId: ULID,
      userId: ULID,
      transactionId: ULID,
      tagId: ULID,
    ) {
      await memberService.assertRole(companyId, userId);
      await assertTransactionInCompany(companyId, transactionId);

      const tag = await tagRepo.findById(tagId);
      if (!tag || tag.companyId !== companyId)
        throw new AppError("TAG_NOT_FOUND");

      if (await linkRepo.findLink(transactionId, tagId))
        throw new AppError("TAG_ALREADY_LINKED");

      const id = generateId();
      await linkRepo.create({ id, transactionId, tagId });

      return { id, transactionId, tagId };
    },

    async detach(
      companyId: ULID,
      userId: ULID,
      transactionId: ULID,
      tagId: ULID,
    ) {
      await memberService.assertRole(companyId, userId);
      await assertTransactionInCompany(companyId, transactionId);

      const link = await linkRepo.findLink(transactionId, tagId);
      if (!link) throw new AppError("TAG_LINK_NOT_FOUND");

      await linkRepo.delete(link.id);
    },
  };
};
