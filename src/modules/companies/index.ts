import type { FastifyInstance } from "fastify";

import { companyRoutes } from "./routes/company.router.js";
// import { memberRoutes } from "./routes/member.router.js";

export default async function (app: FastifyInstance) {
  await app.register(companyRoutes, {
    prefix: "/companies"
  });

  // await app.register(memberRoutes, {
  //   prefix: "/:id/members",
  // });
}
