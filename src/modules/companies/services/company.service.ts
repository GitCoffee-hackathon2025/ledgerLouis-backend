import { createCompanyRepository } from "../repositories/company.repository.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import { generateId, type ULID } from "../../../domain/shared/id.js";
import { getUniqueConstraint } from "../../../infrastructure/database/errors/getUniqueConstraint.js";
import type { createMemberRepository } from "../repositories/member.repository.js";
import type { createMemberService } from "./member.service.js";
import type {createAccountService} from "../../finances/services/account.service.js";

type Optional = string | undefined;

/* 
Quando for criado a base de companyUser deve ser adicionado a validação da permissão que o usuário possui
*/

export const createCompanyService = (
  companyRepo: ReturnType<typeof createCompanyRepository>,
  memberRepo: ReturnType<typeof createMemberRepository>,
  memberService: ReturnType<typeof createMemberService>,
  accountService: ReturnType<typeof createAccountService>,
) => ({
  async find(companyId: ULID, userId: ULID) {
    const found = await memberService.assertRole(companyId, userId);
    if (!found) throw new AppError("COMPANY_NOT_FOUND");
    
    return found;
  },

  async list() {
    return companyRepo.list();
  },

  async create(
    userId: ULID,
    data: {
      name: string;
      cnpj: string;
      email: Optional;
      cep: Optional;
      phone: Optional;
    },
  ) {
    data.name = data.name.trim();
    data.cnpj = data.cnpj.replace(/\D/g, "");

    const id = generateId();

    try {
      await companyRepo.create({ id, ...data });
    } catch (error) {
      switch (getUniqueConstraint(error, ["uq_companies_cnpj"])) {
        case "uq_companies_cnpj":
          throw new AppError("CNPJ_ALREADY_EXISTS");

        case "uq_companies_email":
          throw new AppError("EMAIL_ALREADY_EXISTS");

        case "uq_companies_phone":
          throw new AppError("PHONE_ALREADY_EXISTS");

        default:
          throw error;
      }
    }

    await memberRepo.create({
      companyId: id,
      userId: userId,
      role: "owner",
    });

    await accountService.createDefault(id);

    return { id, name: data.name, cnpj: data.cnpj };
  },

  // async update(
  //   companyId: ULID,
  //   userId: ULID,
  //   data: Partial<{
  //     name: string;
  //     email: string;
  //     cep: string;
  //     phone: string;
  //   }>,
  // ) {
  //   await memberService.assertRole(companyId, userId, ["owner"]);

  //   data.name &&= data.name.trim();

  //   await companyRepo.update(companyId, data);

  //   return companyRepo.findById(companyId);
  // },

  async delete(companyId: ULID, userId: ULID) {
    await memberService.assertRole(companyId, userId, ["owner"]);
    await companyRepo.delete(companyId);
  },
});
