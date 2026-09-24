import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import type { buildAuthModule } from "../module.js";
import { AppError } from "../../../shared/errors/domain/errors.js";

import {
  LoginBody,
  RefreshBody,
  AuthResponse,
  AuthHeader,
  LoginQuery,
} from "../schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const authRouter =
  (
    auth: ReturnType<typeof buildAuthModule>["authService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.post(
      "/login",
      {
        config: { rateLimit: { max: 10, window: 60 } },
        schema: {
          tags: ["auth"],
          summary: "Login user",
          querystring: LoginQuery,
          body: LoginBody,
          response: {
            200: AuthResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.user,
              "INVALID_CREDENTIALS",
            ]),
          },
        },
      },
      async (req, res) => {
        const { email, password } = req.body;

        const tokens = await auth.login(email, password, {
          ipAddress: req.ip,
          ...(req.headers["user-agent"] && {
            userAgent: req.headers["user-agent"],
          }),
        }, req.query.token);

        return res.send(tokens);
      },
    );

    app.post(
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
      async (req, res) => {
        const { refreshToken } = req.body;

        const tokens = await auth.refresh(refreshToken);

        return res.send(tokens);
      },
    );

    app.delete(
      "/logout",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["auth"],
          summary: "Logout current session",
          headers: AuthHeader,
          response: {
            204: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      async (req, res) => {
        if (!req.authUser) throw new AppError("UNAUTHORIZED");

        await auth.logout(req.authUser.sid);

        return res.status(204).send();
      },
    );

    app.delete(
      "/logout-all",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["auth"],
          summary: "Logout all sessions",
          headers: AuthHeader,
          response: {
            204: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      async (req, res) => {
        if (!req.authUser) throw new AppError("UNAUTHORIZED");

        await auth.logoutAll(req.authUser.sub);

        return res.status(204).send();
      },
    );
  };
