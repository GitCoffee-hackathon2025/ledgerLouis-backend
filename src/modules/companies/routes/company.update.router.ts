import type { FastifyPluginAsync } from "fastify";
import { createCompanyUpdateController } from "../controllers/company.update.controller.js";
import { buildCompanyModule } from "../module.js";
import { SchemaEnablesAuth } from "../../../schemas/common/auth.schema.js";
import {
  CompanyResponse,
  CompanyIdParam,
  type UpdateCompanyRoute,
  createUpdateBody,
} from "../schemas/company.schema.js";

import {
  createErrorResponses,
  routeGroups,
} from "../../../shared/errors/schemas/responses.js";

export const companyUpdateRoutes =
  (
    module: ReturnType<
      typeof buildCompanyModule
    >["company"]["companyUpdateService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createCompanyUpdateController(module);

    // Declarando rotas e seus handlers
    const routes = {
      name: { url: "/name", handler: controller.updateName },
      email: { url: "/email", handler: controller.updateEmail },
      cep: { url: "/cep", handler: controller.updateCep },
      phone: { url: "/phone", handler: controller.updatePhone },
    } as const;

    // Passando por cada rota e a regitrando-a
    for (const k of Object.keys(routes) as (keyof typeof routes)[])
      app.patch<UpdateCompanyRoute<typeof k>>(
        routes[k].url,
        {
          preHandler: app.verifyAccess,
          schema: {
            tags: ["companies"],
            summary: `Change company ${k}`,
            ...SchemaEnablesAuth,
            params: CompanyIdParam,
            body: createUpdateBody(k),
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
        routes[k].handler,
      );
  };
