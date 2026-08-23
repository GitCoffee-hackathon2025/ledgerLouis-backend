import { type ULID } from "../../../domain/shared/id.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import { computeExpenseStats } from "../../../shared/math/statistics.js";
import type { createAnalyticsRepository } from "../repositories/analytics.repository.js";
import type { createTagRepository } from "../../tags/repositories/tag.repository.js";
import type { createMemberService } from "../../companies/services/member.service.js";

export const createAnalyticsService = (
  repo: ReturnType<typeof createAnalyticsRepository>,
  tagRepo: ReturnType<typeof createTagRepository>,
  memberService: ReturnType<typeof createMemberService>,
) => ({
  async getExpenseStats(companyId: ULID, userId: ULID, tagId?: ULID) {
    await memberService.assertRole(companyId, userId);

    if (tagId) {
      const tag = await tagRepo.findById(tagId);
      if (!tag || tag.companyId !== companyId) throw new AppError("TAG_NOT_FOUND");

      const records = await repo.listExpensesByCompanyAndTag(companyId, tagId);
      return { tagId, tagName: tag.name, ...computeExpenseStats(records) };
    }

    const records = await repo.listExpensesByCompany(companyId);
    return { tagId: null, tagName: null, ...computeExpenseStats(records) };
  },

  async getExpenseStatsByTag(companyId: ULID, userId: ULID) {
    await memberService.assertRole(companyId, userId);

    const tags = await tagRepo.listByCompany(companyId);

    return Promise.all(
      tags.map(async (tag) => {
        const records = await repo.listExpensesByCompanyAndTag(companyId, tag.id);
        return { tagId: tag.id, tagName: tag.name, ...computeExpenseStats(records) };
      }),
    );
  },
});
