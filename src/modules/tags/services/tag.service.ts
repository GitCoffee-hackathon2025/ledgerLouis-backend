import { createTagRepository } from "../repositories/tag.repository.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import { generateId, type ULID } from "../../../domain/shared/id.js";
import { getUniqueConstraint } from "../../../infrastructure/database/errors/getUniqueConstraint.js";
import type { createMemberService } from "../../companies/services/member.service.js";

export const createTagService = (
  tagRepo: ReturnType<typeof createTagRepository>,
  memberService: ReturnType<typeof createMemberService>,
) => ({
  async find(companyId: ULID, userId: ULID, id: ULID) {
    await memberService.assertRole(companyId, userId);

    const tag = await tagRepo.findById(id);
    if (!tag || tag.companyId !== companyId) throw new AppError("TAG_NOT_FOUND");

    return tag;
  },

  async list(companyId: ULID, userId: ULID) {
    await memberService.assertRole(companyId, userId);

    return tagRepo.listByCompany(companyId);
  },

  async create(companyId: ULID, userId: ULID, name: string) {
    await memberService.assertRole(companyId, userId);

    const id = generateId();
    const trimmed = name.trim();

    try {
      await tagRepo.create({ id, companyId, name: trimmed });
    } catch (error) {
      if (getUniqueConstraint(error, ["uq_tags_company_name"]))
        throw new AppError("TAG_ALREADY_EXISTS");

      throw error;
    }

    return { id, companyId, name: trimmed };
  },

  async update(companyId: ULID, userId: ULID, id: ULID, name: string) {
    await memberService.assertRole(companyId, userId);

    const existing = await tagRepo.findById(id);
    if (!existing || existing.companyId !== companyId)
      throw new AppError("TAG_NOT_FOUND");

    try {
      return await tagRepo.update(id, { name: name.trim() });
    } catch (error) {
      if (getUniqueConstraint(error, ["uq_tags_company_name"]))
        throw new AppError("TAG_ALREADY_EXISTS");

      throw error;
    }
  },

  async delete(companyId: ULID, userId: ULID, id: ULID) {
    await memberService.assertRole(companyId, userId);

    const existing = await tagRepo.findById(id);
    if (!existing || existing.companyId !== companyId)
      throw new AppError("TAG_NOT_FOUND");

    await tagRepo.delete(id);
  },
});
