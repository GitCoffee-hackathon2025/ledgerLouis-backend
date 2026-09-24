import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import {
  RegistedUserResponse,
  RegisterBody,
  UpdateBody,
  UserResponse,
} from "../schema.js";

import { buildUserModule } from "../module.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import { AppError } from "../../../shared/errors/domain/errors.js";

export const userRouter =
  (
    userService: ReturnType<typeof buildUserModule>["userService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.post(
      "/",
      {
        schema: {
          tags: ["users"],
          summary: "Register user",
          body: RegisterBody,
          response: {
            201: RegistedUserResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.user,
            ]),
          },
        },
      },
      async (req, reply) => {
        const { name, email, password } = req.body;

        const result = await userService.register(
          { name, email, password },
          req.server.config.WEB_URL,
        );

        return reply.status(201).send({
          ...result,
          expiresAt: result.expiresAt.toISOString(),
          cooldown: result.cooldown.toISOString(),
        });
      },
    );

    app.get(
      "/me",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Get authenticated user",
          response: {
            200: UserResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
            ]),
          },
        },
      },
      async (req, reply) => {
        const user = await userService.findById(req.authUser.sub);

        if (!user) throw new AppError("USER_NOT_FOUND");

        return reply.status(200).send(user);
      },
    );

    app.patch(
      "/me",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Update authenticated user",
          body: UpdateBody,
          response: {
            200: UserResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.user,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      async (req, reply) => {
        const result = await userService.update(req.authUser.sub, {
          name: req.body.name,
          email: req.body.email,
        });

        return reply.status(200).send(result);
      },
    );

    app.delete(
      "/me",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Delete authenticated user",
          response: {
            204: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      async (req, reply) => {
        await userService.delete(req.authUser.sub);

        return reply.status(204).send();
      },
    );
  };
