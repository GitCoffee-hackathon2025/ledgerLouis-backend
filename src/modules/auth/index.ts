import type { FastifyInstance } from "fastify";
import { authRouter } from "./router.js";

export default async function (app: FastifyInstance) {
  await app.register(authRouter, {
    prefix: "/auth",
  });
}
