import type { FastifyPluginAsync } from "fastify";

import { buildUserModule } from "./module.js";
import { createUserController } from "./controller.js";

import { SchemaEnablesAuth } from "../../schemas/common/auth.schema.js";

import {
  RegisterBody,
  UpdateBody,
  UserResponse,
  UserListResponse,
  UploadAvatarResponse,
  type RegisterRoute,
  type UpdateRoute,
} from "./schema.js";

import {
  createErrorResponses,
  routeGroups,
} from "../../shared/errors/schemas/responses.js";

export const userRouter = (): FastifyPluginAsync => async (app) => {
  const module = buildUserModule(app);

  const controller = createUserController(app.auth.authService, module);

  app.post<RegisterRoute>(
    "/register",
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

  app.put<UpdateRoute>(
    "/update",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["users"],
        summary: "Update user",
        ...SchemaEnablesAuth,
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

  app.post(
    "/me/profile-image",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["users"],
        summary: "Upload user avatar",
        ...SchemaEnablesAuth,
        consumes: ["multipart/form-data"],
        response: {
          200: UploadAvatarResponse,
          ...createErrorResponses([...routeGroups.common, ...routeGroups.auth]),
        },
      },
    },
    controller.uploadAvatar,
  );

  app.get(
    "/",
    {
      schema: {
        tags: ["users"],
        summary: "Get all users",
        response: {
          200: UserListResponse,
          ...createErrorResponses([...routeGroups.common]),
        },
      },
    },
    controller.list,
  );

  app.delete(
    "/",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["users"],
        summary: "Delete user",
        ...SchemaEnablesAuth,
        response: {
          204: { type: "null" },
          ...createErrorResponses([...routeGroups.common, ...routeGroups.auth]),
        },
      },
    },
    controller.delete,
  );

  app.get(
    "/me",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["users"],
        summary: "Get authenticated user",
        ...SchemaEnablesAuth,
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
    controller.getById,
  );
};
