import type { FastifyInstance } from "fastify";
import { buildAuthModule } from "./module.js";
import { authRouter } from "./router.js";

export default async function (app: FastifyInstance) {
  const module = buildAuthModule(app.db);

  await app.register(authRouter(module), {
    prefix: "/auth",
  });
}
