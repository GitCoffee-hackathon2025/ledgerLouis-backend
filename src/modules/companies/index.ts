import type { FastifyInstance } from "fastify";

import { buildCompanyModule } from "./module.js";

import { companyRoutes } from "./routes/company.router.js";
import { memberRoutes } from "./routes/member.router.js";

export default async function (app: FastifyInstance) {
  const companyModule = buildCompanyModule(app);

  await app.register(companyRoutes(companyModule.companyService), {
    prefix: "/companies",
  });

  await app.register(memberRoutes(companyModule.memberService), {
    // prefix: "/companies/:id/members",
    // caso seja necessário aplicar esse prefix, será necessário mover o /me para user ou outro modulo ou rota especifica pra ele
  });
}
