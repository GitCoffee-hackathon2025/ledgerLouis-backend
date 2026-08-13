import type { FastifyPluginAsync } from "fastify";

import { createProfileImageController } from "../controllers/profileImage.controller.js";
import { buildUserModule } from "../module.js";

import {
  ProfileImageResponse,
  type UploadProfileImageRoute,
  type OpenProfileImageRoute,
  type DeleteProfileImageRoute,
} from "../schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const profileImageRouter =
  (
    profileImageService: ReturnType<
      typeof buildUserModule
    >["profileImageService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createProfileImageController(profileImageService);

    app.post<UploadProfileImageRoute>(
      "/me/profile-image",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        attachValidation: true,
        schema: {
          tags: ["users"],
          summary: "Upload profile image",
          consumes: ["multipart/form-data"],
          body: {
            type: "object",
            required: ["file"],
            properties: { file: { isFile: true } },
          },
          response: {
            201: ProfileImageResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
            ]),
          },
        },
      },
      controller.upload,
    );

    app.get<OpenProfileImageRoute>(
      "/me/profile-image",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Open profile image",
          response: {
            200: { type: "null" },
            302: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
            ]),
          },
        },
      },
      controller.open,
    );

    app.delete<DeleteProfileImageRoute>(
      "/me/profile-image",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Delete profile image",
          response: {
            204: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
            ]),
          },
        },
      },
      controller.delete,
    );
  };
