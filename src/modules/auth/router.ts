import type { FastifyInstance } from "fastify";
import { createAuthController } from "./controller.js";
import {
  AuthSchema,
  LoginBody,
  RefreshBody,
  AuthResponse,
  EmptyResponse,
  AuthHeader,
} from "./schema.js";

import {
  createErrorResponses,
  routeGroups,
} from "../../shared/errors/schemas/responses.js";

export async function authRouter(app: FastifyInstance) {
  const routes = createAuthController();

  app.post(
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

  app.post(
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

  app.delete(
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

  app.delete(
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
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form, "UNAUTHORIZED", 
            "INVALID_TOKEN", "TOKEN_EXPIRED"
          ]),
        },
      },
    },
    routes.logoutAll,
  );
}
