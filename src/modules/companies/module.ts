import type { FastifyInstance } from "fastify";

import { createCompanyRepository } from "./repository.js";
import { createCompanyService } from "./service.js";

export function buildCompanyModule(app: FastifyInstance) {
  const repo = createCompanyRepository(app.db);
  const companyService = createCompanyService(repo);

  return companyService;
}
