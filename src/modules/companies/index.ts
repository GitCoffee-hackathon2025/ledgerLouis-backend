import type { FastifyInstance } from "fastify";
import { buildCompanyRoutes } from "./routes/company.router.js";
import { buildCompanyModule } from "./module.js";
import { Type } from "@sinclair/typebox";
import {
  AuthSchema,
  CompaniesListResponse,
  CompanyResponse,
  CreateBody,
  ErrorResponse,
  UpdateBody,
  IdParam,
} from "./schema.js";

export default async function (app: FastifyInstance) {
  const router = buildCompanyRoutes(buildCompanyModule(app));

  app.get(
    "/:id",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["companies"],
        summary: "Find company by id",
        ...AuthSchema,
        params: IdParam,
        response: {
          200: CompanyResponse,
          401: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    router.get,
  );

  app.get(
    "/",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["companies"],
        summary: "List all companies",
        ...AuthSchema,
        response: {
          200: CompaniesListResponse,
          401: ErrorResponse,
        },
      },
    },
    router.list,
  );

  app.post(
    "/",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["companies"],
        summary: "Create company",
        ...AuthSchema,
        body: CreateBody,
        response: {
          201: CompanyResponse,
          400: ErrorResponse,
          401: ErrorResponse,
          409: ErrorResponse,
        },
      },
    },
    router.create,
  );

  app.patch(
    "/:id",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["companies"],
        summary: "Update company",
        ...AuthSchema,
        params: IdParam,
        body: UpdateBody,
        response: {
          200: CompanyResponse,
          400: ErrorResponse,
          401: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    router.update,
  );

  app.delete(
    "/:id",
    {
      preHandler: app.verifyAccess,
      schema: {
        tags: ["companies"],
        summary: "Delete company",
        ...AuthSchema,
        params: IdParam,
        response: {
          204: Type.Null(),
          401: ErrorResponse,
          404: ErrorResponse,
        },
      },
    },
    router.delete,
  );
}
