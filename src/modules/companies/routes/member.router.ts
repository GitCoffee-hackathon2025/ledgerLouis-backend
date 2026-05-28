import type { FastifyInstance } from "fastify";
import { createCompanyController } from "../controllers/company.controller.js";
import { buildCompanyModule } from "../module.js";
// import { Type } from "@sinclair/typebox";

export async function companyRoutes(app: FastifyInstance) {
  const controller = createCompanyController(buildCompanyModule(app));

}
