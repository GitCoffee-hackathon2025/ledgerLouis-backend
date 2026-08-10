import type { FastifyPluginAsync } from "fastify";

import { createUserController } from "../controllers/user.controller.js";
import { buildUserModule } from "../module.js";

import {
  RegisterBody,
  UpdateBody,
  UserResponse,
  type DeleteRoute,
  type GetMeRoute,
  type UpdateRoute,
  type RegisterRoute,
} from "../schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const userRouter =
  (
    userService: ReturnType<typeof buildUserModule>["userService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createUserController(userService);

    app.post<RegisterRoute>(
      "/",
      {
        schema: {
          tags: ["users"],
          summary: "Register user",
          body: RegisterBody,
          response: {
            201: UserResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.user,
            ]),
          },
        },
      },
      controller.register,
    );

    app.get<GetMeRoute>(
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
      controller.getMe,
    );

    app.patch<UpdateRoute>(
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
      controller.update,
    );

    app.delete<DeleteRoute>(
      "/me",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Delete authenticated user",
          response: {
            204: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.delete,
    );
  };
