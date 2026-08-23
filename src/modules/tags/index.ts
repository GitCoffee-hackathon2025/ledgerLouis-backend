import type { FastifyInstance } from "fastify";

import { buildTagModule } from "./module.js";

import { tagRoutes } from "./routes/tag.router.js";
import { transactionTagRoutes } from "./routes/transactionTag.router.js";

export default async function (app: FastifyInstance) {
  const module = buildTagModule(app.db);

  await app.register(tagRoutes(module.tagService), { prefix: "/companies" });
  await app.register(transactionTagRoutes(module.transactionTagService), {
    prefix: "/companies",
  });
}
