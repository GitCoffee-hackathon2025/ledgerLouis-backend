import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { createUserController } from "./controller.js";

import { RegisterBody, UserResponse, ErrorResponse } from "./schema.js";
// import { createErrorResponses } from "../../shared/errors/schemas/responses.js";

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
          // ...createErrorResponses(['EMAIL_ALREADY_EXISTS', 'VALIDATION_ERROR']),
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.register,
  );
}
