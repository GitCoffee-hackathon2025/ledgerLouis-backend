import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { createUserController } from "./controller.js";

import { RegisterBody, UserResponse } from "./schema.js";
import {
  createErrorResponses,
  routeGroups,
} from "../../shared/errors/schemas/responses.js";

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
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
          ]),
        },
      },
    },
    routes.register,
  );
}
