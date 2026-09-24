import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import { buildUserModule } from "../module.js";

import { ProfileImageResponse } from "../schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import { AppError } from "../../../shared/errors/domain/errors.js";

export const profileImageRouter =
  (
    profileImageService: ReturnType<
      typeof buildUserModule
    >["profileImageService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.post(
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
              ...routeGroups.file,
            ]),
          },
        },
      },
      async (req, reply) => {
        const multipart = await req.file();
        if (!multipart) throw new AppError("FILE_REQUIRED");
        if (!multipart.mimetype.startsWith("image/"))
          throw new AppError("INVALID_FILE_TYPE");

        const image = await profileImageService.upload(req.authUser.sub, {
          originalName: multipart.filename,
          mimeType: multipart.mimetype,
          size: multipart.file.bytesRead,
          file: multipart.file,
        });
        
        return reply.status(201).send(image);
      },
    );

    app.get(
      "/me/profile-image",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Open profile image",
          response: {
            200: {},
            302: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.file,
            ]),
          },
        },
      },
      async (req, reply) => {
        const resource = await profileImageService.open(req.authUser.sub);
        if (resource.type === "stream")
          return reply.status(200).send(resource.stream);
        return reply.status(302).redirect(resource.url);
      },
    );

    app.delete(
      "/me/profile-image",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Delete profile image",
          response: {
            204: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.file,
            ]),
          },
        },
      },
      async (req, reply) => {
        await profileImageService.delete(req.authUser.sub);
        return reply.status(204).send();
      },
    );
  };
