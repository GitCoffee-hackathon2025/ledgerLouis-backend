import type { FastifyInstance } from "fastify";

import { buildCompanyModule } from "./module.js";

import { companyRoutes } from "./routes/company.router.js";
import { companyUpdateRoutes } from "./routes/company.update.router.js";
import { memberRoutes } from "./routes/member.router.js";
import { companyInvitationRoutes } from "./routes/company.invitation.router.js";
import { invitationRoutes } from "./routes/invitation.router.js";

export default async function (app: FastifyInstance) {
  const { company, memberService, invitationService } = buildCompanyModule(
    app.db,
    app.redis.adapter,
  );

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

  const invitationUrl = "/invitations";

  await app.register(
    companyInvitationRoutes(
      invitationService,
      app.config.WEB_URL + invitationUrl,
    ),
    { prefix: "/companies/:companyId" + invitationUrl },
  );

  await app.register(invitationRoutes(invitationService), {
    prefix: invitationUrl + "/:token",
  });
}
