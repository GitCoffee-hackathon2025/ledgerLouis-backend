import type { FastifyInstance } from "fastify";
import { userRouter } from "./router.js";

export default async function (app: FastifyInstance) {
  await app.register(userRouter, {
    prefix: "/users",
  });
}
