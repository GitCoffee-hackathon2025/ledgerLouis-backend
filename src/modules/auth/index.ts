import { FastifyInstance } from "fastify";
import { buildAuthRoutes } from "./routes";
import { ErrorResponse, RefreshBody, RefreshResponse } from "./schema";

export default async function (app: FastifyInstance) {
  const routes = buildAuthRoutes();
  app.post(
    "/refresh",
    {
      schema: {
        tags: ["auth"],
        summary: "Refresh token",
        body: RefreshBody,
        response: {
          200: RefreshResponse,
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
        response: {
          204: {},
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
        response: {
          204: {},
          401: ErrorResponse,
        },
      },
    },
    routes.logoutAll,
  );
}
