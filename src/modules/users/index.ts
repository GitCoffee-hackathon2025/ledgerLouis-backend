import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { buildUserRoutes } from "./routes.js";

import {
  RegisterBody,
  UserResponse,
  ErrorResponse,
} from "./schema.js";

export default async function (app: FastifyInstance) {
  const routes = buildUserRoutes(buildUserModule(app));

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

  // app.post(
  //   "/login",
  //   {
  //     schema: {
  //       tags: ["auth"],
  //       summary: "Login user",
  //       body: LoginBody,
  //       response: {
  //         200: AuthResponse,
  //         401: ErrorResponse,
  //       },
  //     },
  //   },
  //   routes.login,
  // );
}
