import type { FastifyInstance } from "fastify";
import { createCompanyController } from "../controllers/company.controller.js";
import { buildCompanyModule } from "../module.js";

/* 
GET    /companies/:companyId/members
POST   /companies/:companyId/members

GET /companies/:companyId/members/:userId
PATCH  /companies/:companyId/members/:userId
DELETE /companies/:companyId/members/:userId

GET    /me/companies
*/

export async function companyRoutes(app: FastifyInstance) {
  const controller = createCompanyController(buildCompanyModule(app));

}
