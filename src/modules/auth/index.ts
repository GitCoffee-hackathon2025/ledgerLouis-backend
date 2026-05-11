import type { FastifyInstance } from "fastify";
import { buildAuthRoutes } from "./routes.js";
import {
  AuthSchema,
  ErrorResponse,
  LoginBody,
  RefreshBody,
  AuthResponse,
  EmptyResponse,
  AuthHeader,
} from "./schema.js";
export default async function (app: FastifyInstance) {
  const routes = buildAuthRoutes();

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

  app.post(
    "/refresh",
    {
      schema: {
        tags: ["auth"],
        summary: "Refresh token",
        body: RefreshBody,
        response: {
          200: AuthResponse,
          401: ErrorResponse,
        },
      },
    },
    routes.refresh,
  );

  app.post(
    "/logout",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["auth"],
        summary: "Logout current session",
        ...AuthSchema,
        headers: AuthHeader,
        response: {
          204: EmptyResponse,
          401: ErrorResponse,
        },
      },
    },
    routes.logout,
  );

  app.post(
    "/logout-all",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["auth"],
        summary: "Logout all sessions",
        ...AuthSchema,
        headers: AuthHeader,
        response: {
          204: EmptyResponse,
          401: ErrorResponse,
        },
      },
    },
    routes.logoutAll,
  );
}
