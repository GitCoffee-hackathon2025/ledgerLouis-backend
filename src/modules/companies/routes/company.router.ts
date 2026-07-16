import type { FastifyPluginAsync } from "fastify";
import { createCompanyController } from "../controllers/company.controller.js";
import { buildCompanyModule } from "../module.js";
import { SchemaEnablesAuth } from "../../../schemas/common/auth.schema.js";
import {
  CompaniesListResponse,
  CompanyResponse,
  CreateBody,
  CompanyIdParam,
  type GetCompanyRoute,
  type CreateCompanyRoute,
  type DeleteCompanyRoute,
} from "../schemas/company.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const companyRoutes =
  (
    module: ReturnType<typeof buildCompanyModule>["company"]["companyService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createCompanyController(module);

    app.get<GetCompanyRoute>(
      "/:companyId",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["companies"],
          summary: "Find company by id",
          ...SchemaEnablesAuth,
          params: CompanyIdParam,
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
        schema: {
          tags: ["companies"],
          summary: "List all companies",
          response: {
            200: CompaniesListResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
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
          ...SchemaEnablesAuth,
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

    app.delete<DeleteCompanyRoute>(
      "/:companyId",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["companies"],
          summary: "Delete company",
          ...SchemaEnablesAuth,
          params: CompanyIdParam,
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
  };
