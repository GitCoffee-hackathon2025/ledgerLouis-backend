import type { FastifyInstance } from "fastify";

import { buildCompanyModule } from "./module.js";

import { companyRoutes } from "./routes/company.router.js";
import { companyUpdateRoutes } from "./routes/company.update.router.js";
import { memberRoutes } from "./routes/member.router.js";

export default async function (app: FastifyInstance) {
  const { company, memberService } = buildCompanyModule(app);

  await app.register(companyRoutes(company.companyService), {
    prefix: "/companies",
  });

  await app.register(companyUpdateRoutes(company.companyUpdateService), {
    prefix: "/companies/:companyId/profile",
  });

  await app.register(memberRoutes(memberService), {
    // prefix: "/companies/:id/members",
    // caso seja necessário aplicar esse prefix, será necessário mover o /me para user ou outro modulo ou rota especifica pra ele
  });
}
