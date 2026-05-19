import type { FastifyInstance } from "fastify";
import { createCompanyController } from "../controllers/company.controller.js";
import { buildCompanyModule } from "../module.js";
import { Type } from "@sinclair/typebox";

import {
  AuthSchema,
  CompaniesListResponse,
  CompanyResponse,
  CreateBody,
  ErrorResponse,
  UpdateBody,
  IdParam,
  type GetCompanyRoute,
  type CreateCompanyRoute,
  type UpdateCompanyRoute,
  type DeleteCompanyRoute,
} from "../schemas/company.schema.js";

export async function companyRoutes(app: FastifyInstance) {
  const controller = createCompanyController(buildCompanyModule(app));

  app.get<GetCompanyRoute>(
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
    controller.get,
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
    controller.list,
  );

  app.post<CreateCompanyRoute>(
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
    controller.create,
  );

  app.patch<UpdateCompanyRoute>(
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
    controller.update,
  );

  app.delete<DeleteCompanyRoute>(
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
    controller.delete,
  );
}
