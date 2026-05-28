import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { buildUserRoutes } from "./routes.js";

import { RegisterBody, UserResponse, ErrorResponse, UpdateBody, UserListResponse, UploadAvatarBody } from "./schema.js";
import { Type } from "@sinclair/typebox";

export default async function (app: FastifyInstance) {
  const routes = buildUserRoutes(app.auth.authService, buildUserModule(app));

  app.post(
    "/register",
    {
      schema: {
        tags: ["users"],
        summary: "Register user",
        body: RegisterBody,
        response: {
          201: UserResponse,
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.register,
  );
  app.put(
    "/update",
    {
      schema: {
        tags: ["users"],
        summary: "Update user",
        body: UpdateBody,
        response: {
          200: UserResponse,
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.update
  );
  app.post(
  "/me/profile-image",
  {
    schema: {
      tags: ["users"],
      summary: "Upload user avatar",

      consumes: [
        "multipart/form-data"
      ],

      response: {
        200: UserResponse,
        400: ErrorResponse,
      },
    },
  },

  routes.uploadAvatar
);
  app.get(
    "/",
    {
      schema: {
        tags: ["users"],
        summary: "Get all users",
        response: {
          200: UserListResponse,
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.getAll
  );

  app.auth.authService.logoutAll

  app.delete(
    "/",
    {
      schema: {
        tags: ["users"],
        summary: "Delete user",
        response: {
          204: Type.Null(),
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.delete
  );  
  app.get(
    "/byID",
    {
      schema: {
        tags: ["users"],
        summary: "Get user by ID",
        response: {
          200: UserResponse,
          404: ErrorResponse,
        },
      },
    },
    routes.getById
  );
}
