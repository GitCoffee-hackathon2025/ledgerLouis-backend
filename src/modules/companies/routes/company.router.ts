import type { FastifyInstance } from "fastify";
import { createCompanyController } from "../controllers/company.controller.js";
import { buildCompanyModule } from "../module.js";

import {
  AuthSchema,
  CompaniesListResponse,
  CompanyResponse,
  CreateBody,
  UpdateBody,
  IdParam,
  type GetCompanyRoute,
  type CreateCompanyRoute,
  type UpdateCompanyRoute,
  type DeleteCompanyRoute,
} from "../schemas/company.schema.js";

import {
  createErrorResponses,
  routeGroups,
} from "../../../shared/errors/schemas/responses.js";

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
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.auth,
            ...routeGroups.company,
          ]),
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
          ...createErrorResponses([...routeGroups.common, ...routeGroups.auth]),
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
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
            ...routeGroups.auth,
            ...routeGroups.company,
            "CNPJ_ALREADY_EXISTS",
          ]),
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
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.form,
            ...routeGroups.auth,
            ...routeGroups.company,
          ]),
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
          204: { type: "null" },
          ...createErrorResponses([
            ...routeGroups.common,
            ...routeGroups.auth,
            ...routeGroups.company,
          ]),
        },
      },
    },
    controller.delete,
  );
}
