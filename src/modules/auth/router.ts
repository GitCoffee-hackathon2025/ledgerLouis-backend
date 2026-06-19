import type { FastifyInstance } from "fastify";
import { createAuthController } from "./controller.js";
import { SchemaEnablesAuth } from "../../schemas/common/auth.schema.js";
import {
  LoginBody,
  RefreshBody,
  AuthResponse,
  AuthHeader,
  type LoginRoute,
  type RefreshRoute,
  type LogoutRoute,
  type LogoutAllRoute,
} from "./schema.js";
import {
  createErrorResponses,
  routeGroups,
} from "../../shared/errors/schemas/responses.js";

export async function authRouter(app: FastifyInstance) {
  const routes = createAuthController();

  app.post<LoginRoute>(
    "/login",
    {
      schema: {
        tags: ["auth"],
        summary: "Login user",
        body: LoginBody,
        response: {
          200: AuthResponse,
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
            "INVALID_CREDENTIALS",
          ]),
        },
      },
    },
    routes.login,
  );

  app.post<RefreshRoute>(
    "/refresh",
    {
      schema: {
        tags: ["auth"],
        summary: "Refresh token",
        body: RefreshBody,
        response: {
          200: AuthResponse,
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
            "INVALID_TOKEN",
            "TOKEN_EXPIRED",
            "TOKEN_REUSE_DETECTED",
          ]),
        },
      },
    },
    routes.refresh,
  );

  app.delete<LogoutRoute>(
    "/logout",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["auth"],
        summary: "Logout current session",
        ...SchemaEnablesAuth,
        headers: AuthHeader,
        response: {
          204: { type: "null" },
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
            "UNAUTHORIZED",
            "INVALID_TOKEN",
            "TOKEN_EXPIRED",
          ]),
        },
      },
    },
    routes.logout,
  );

  app.delete<LogoutAllRoute>(
    "/logout-all",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["auth"],
        summary: "Logout all sessions",
        ...SchemaEnablesAuth,
        headers: AuthHeader,
        response: {
          204: { type: "null" },
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
            "UNAUTHORIZED",
            "INVALID_TOKEN",
            "TOKEN_EXPIRED",
          ]),
        },
      },
    },
    routes.logoutAll,
  );
}
