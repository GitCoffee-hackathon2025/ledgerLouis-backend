import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { buildAuthRoutes } from "./routes.js";
import {
  ErrorResponse,
  RefreshBody,
  AuthResponse,
  EmptyResponse,
  AuthHeader,
} from "./schema.js";
export default fp(
  async function (app: FastifyInstance) {
    const routes = buildAuthRoutes();

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
        preHandler: app.verifyAccessToken,
        schema: {
          tags: ["auth"],
          summary: "Logout current session",
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
        preHandler: app.verifyAccessToken,
        schema: {
          tags: ["auth"],
          summary: "Logout all sessions",
          headers: AuthHeader,
          response: {
            204: EmptyResponse,
            401: ErrorResponse,
          },
        },
      },
      routes.logoutAll,
    );
  },
  {
    name: "auth-routes",
    dependencies: ["auth"],
  },
);
