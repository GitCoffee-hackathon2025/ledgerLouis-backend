import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";

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
              "INVALID_TOKEN",
              "TOKEN_EXPIRED",
              "UNAUTHORIZED",
              "FILE_REQUIRED",
              "INVALID_FILE_TYPE",
              "FILE_TOO_LARGE",
              "FILE_NOT_FOUND",
              "UPLOAD_FAILED",
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

    app.get<{ Reply: NodeJS.ReadableStream }>(
      "/me/profile-image",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["users"],
          summary: "Open profile image",
          produces: ["application/octet-stream"],
          response: {
            200: Type.String({ format: "binary" }),
            302: {},
            ...createErrorResponses([
              ...routeGroups.common,
              "INVALID_TOKEN",
              "TOKEN_EXPIRED",
              "UNAUTHORIZED",
              "PROFILE_IMAGE_NOT_FOUND",
              "FILE_NOT_FOUND",
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
              "INVALID_TOKEN",
              "TOKEN_EXPIRED",
              "UNAUTHORIZED",
              "PROFILE_IMAGE_NOT_FOUND",
              "FILE_NOT_FOUND",
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
