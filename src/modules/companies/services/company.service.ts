import { createCompanyRepository } from "../repositories/company.repository.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import { generateId, type ULID } from "../../../domain/shared/id.js";
import { isUniqueConstraint } from "../../../infrastructure/database/errors/isUniqueConstraint.js";
import type { createMemberRepository } from "../repositories/member.repository.js";
import type { createMemberService } from "./member.service.js";

/* 
Quando for criado a base de companyUser deve ser adicionado a validação da permissão que o usuário possui
*/

export const createCompanyService = (
  companyRepo: ReturnType<typeof createCompanyRepository>,
  memberRepo: ReturnType<typeof createMemberRepository>,
  memberService: ReturnType<typeof createMemberService>,
) => ({
  async find(companyId: ULID, userId: ULID) {
    await memberService.assertRole(companyId, userId);
    return companyRepo.findById(companyId);
  },

  async list() {
    return companyRepo.list();
  },

  async create(userId: ULID, name: string, cnpj: string) {
    name = name.trim();
    cnpj = cnpj.replace(/\D/g, "");

    const id = generateId();

    try {
      await companyRepo.create({ id, name, cnpj });
    } catch (error) {
      if (isUniqueConstraint(error, "companies_cnpj_unique"))
        throw new AppError("CNPJ_ALREADY_EXISTS");
      throw error;
    }

    await memberRepo.create({
      companyId: id,
      userId: userId,
      role: "owner",
    });

    return { id, name, cnpj };
  },

  async update(companyId: ULID, userId: ULID, name: string) {
    await memberService.assertRole(companyId, userId, ["owner"]);

    name = name.trim();
    await companyRepo.updateName(companyId, name);

    return companyRepo.findById(companyId);
  },

  async delete(companyId: ULID, userId: ULID) {
    await memberService.assertRole(companyId, userId, ["owner"]);
    await companyRepo.delete(companyId);
  },
});
