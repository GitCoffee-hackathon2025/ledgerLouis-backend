import { createCompanyRepository } from "../repositories/company.repository.js";
import type { createMemberService } from "./member.service.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import { type ULID } from "../../../domain/shared/id.js";

export const createCompanyUpdateService = (
  companyRepo: ReturnType<typeof createCompanyRepository>,
  memberService: ReturnType<typeof createMemberService>,
) => ({
  async updateName(companyId: ULID, userId: ULID, name: string) {
    await memberService.assertRole(companyId, userId, ["owner"]);

    const updated = await companyRepo.update(companyId, { name: name.trim() });
    if (!updated) throw new AppError("COMPANY_NOT_FOUND");

    return updated;
  },

  async updateEmail(companyId: ULID, userId: ULID, email: string) {
    await memberService.assertRole(companyId, userId, ["owner"]);

    const updated = await companyRepo.update(companyId, { email });
    if (!updated) throw new AppError("COMPANY_NOT_FOUND");

    return updated;
  },

  async updateCep(companyId: ULID, userId: ULID, cep: string) {
    await memberService.assertRole(companyId, userId, ["owner"]);

    const updated = await companyRepo.update(companyId, { cep });
    if (!updated) throw new AppError("COMPANY_NOT_FOUND");

    return updated;
  },

  async updatePhone(companyId: ULID, userId: ULID, phone: string) {
    await memberService.assertRole(companyId, userId, ["owner"]);

    const updated = await companyRepo.update(companyId, { phone });
    if (!updated) throw new AppError("COMPANY_NOT_FOUND");

    return updated;
  },
});
