import type { FastifyInstance } from "fastify";

import { createCompanyRepository } from "./repositories/company.repository.js";
import { createCompanyService } from "./services/company.service.js";

export function buildCompanyModule(app: FastifyInstance) {
  const repo = createCompanyRepository(app.db);
  const companyService = createCompanyService(repo);

  return companyService;
}
