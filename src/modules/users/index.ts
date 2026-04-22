import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { buildUserModule } from "./module";
import { buildUserRoutes } from "./routes";

import { RegisterBody, LoginBody, UserResponse, ErrorResponse } from "./schema";

import { AuthResponse } from "../auth/schema";

export default fp(
  async function (app: FastifyInstance) {
    app.decorate("user", buildUserModule(app));

    const routes = buildUserRoutes();

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

    app.post(
      "/login",
      {
        schema: {
          tags: ["auth"],
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
  },
  {
    name: "users-routes",
    dependencies: ["db", "auth"],
  },
);
