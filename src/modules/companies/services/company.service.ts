import { createCompanyRepository } from "../repositories/company.repository.js";
import { AppError } from "../../../shared/errors/basicErrors.js";
import { generateId, type ULID } from "../../../lib/id.js";
import { isUniqueConstraint } from "../../../lib/database/error.js";

/* 
Quando for criado a base de companyUser deve ser adicionado a validação da permissão que o usuário possui
*/

export const createCompanyService = (
  repo: ReturnType<typeof createCompanyRepository>,
) => ({
  async find(companyId: ULID) {
    return repo.findById(companyId);
  },

  async list() {
    return repo.list();
  },

  async create(name: string, cnpj: string) {
    name = name.trim();
    cnpj = cnpj.replace(/\D/g, "");

    const id = generateId();

    try {
      await repo.create({ id, name, cnpj });
    } catch (error) {
      if (isUniqueConstraint(error, "companies_cnpj_unique"))
        throw new AppError("CNPJ_ALREADY_EXISTS");
      throw error;
    }

    return { id, name, cnpj };
  },

  async update(companyId: ULID, name: string) {
    name = name.trim();
    await repo.updateName(companyId, name);

    return repo.findById(companyId);
  },

  async delete(companyId: ULID) {
    await repo.delete(companyId);
  },
});
