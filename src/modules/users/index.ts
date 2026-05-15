import type { FastifyInstance } from "fastify";
import { buildUserModule } from "./module.js";
import { buildUserRoutes } from "./routes.js";

import { RegisterBody, UserResponse, ErrorResponse, UpdateBody } from "./schema.js";

export default async function (app: FastifyInstance) {
  const routes = buildUserRoutes(buildUserModule(app));

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
  app.get(
    "/",
    {
      schema: {
        tags: ["users"],
        summary: "Get all users",
        response: {
          200: UserResponse,
          400: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    routes.getAll
  );
  app.delete(
    "/",
    {
      schema: {
        tags: ["users"],
        summary: "Delete user",
        response: {
          204: {},
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
