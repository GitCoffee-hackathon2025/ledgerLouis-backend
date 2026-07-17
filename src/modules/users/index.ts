import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { userRouter } from "./router.js";

export default async function (app: FastifyInstance) {
  const module = buildUserModule(app.db, app.storage);

  await app.register(userRouter(module), {
    prefix: "/users",
  });
}
