import { FastifyInstance } from "fastify";
import { buildUserModule } from "./module";
import { buildUserRoutes } from "./routes";

import {
  RegisterBody,
  LoginBody,
  UserResponse,
  AuthResponse,
  ErrorResponse,
} from "./schema";

export default async function (app: FastifyInstance) {
  const user = buildUserModule(app);
  const routes = buildUserRoutes(user);

  app.post(
    "/register",
    {
      schema: {
        tags: ["users"],
        summary: "Register user",
        body: RegisterBody,
        response: {
          201: UserResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.register,
  );

  app.post(
    "/login",
    {
      schema: {
        tags: ["users"],
        summary: "Login user",
        body: LoginBody,
        response: {
          200: AuthResponse,
          401: ErrorResponse,
        },
      },
    },
    routes.login,
  );
}
