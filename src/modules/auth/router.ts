import type { FastifyPluginAsync } from "fastify";
import type { buildAuthModule } from "./module.js";
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
import { createErrorResponses } from "../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../shared/errors/domain/groups.js";

export const authRouter =
  (module: ReturnType<typeof buildAuthModule>): FastifyPluginAsync =>
  async (app) => {
    const controller = createAuthController(module);

    app.post<LoginRoute>(
      "/login",
      {
        config: { rateLimit: { max: 10, window: 60 } },
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
      controller.login,
    );

    app.post<RefreshRoute>(
      "/refresh",
      {
        config: { rateLimit: { max: 30, window: 60 } },
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
      controller.refresh,
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
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.logout,
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
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.logoutAll,
    );
  };
