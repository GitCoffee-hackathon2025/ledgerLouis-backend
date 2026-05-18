import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { createUserController } from "./controller.js";

import { RegisterBody, UserResponse, ErrorResponse } from "./schema.js";

export async function userRouter(app: FastifyInstance) {
  const routes = createUserController(buildUserModule(app));

  app.post(
    "/register",
    {
      schema: {
        tags: ["users"],
        summary: "Register user",
        body: RegisterBody,
        response: {
          201: UserResponse,
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.register,
  );
}
