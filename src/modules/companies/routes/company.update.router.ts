import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { buildCompanyModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";
import {
  CompanyResponse,
  CompanyIdParam,
  createUpdateBody,
} from "../schemas/company.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const companyUpdateRoutes =
  (
    module: ReturnType<
      typeof buildCompanyModule
    >["company"]["companyUpdateService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    for (const key of ["name", "email", "cep", "phone"] as const) {
      app.patch(
        `/${key}`,
        {
          preHandler: app.verifyAccess,
          config: { auth: true },
          schema: {
            tags: ["companies"],
            summary: `Change company ${key}`,
            params: CompanyIdParam,
            body: createUpdateBody(key),
            response: {
              200: CompanyResponse,
              ...createErrorResponses([
                ...routeGroups.common,
                ...routeGroups.form,
                ...routeGroups.auth,
                ...routeGroups.permission,
                ...routeGroups.member,
                ...routeGroups.company,
              ]),
            },
          },
        },
        async (req, reply) => {
          const companyId = toId(req.params.companyId);
          const userId = req.authUser.sub;
          const value = req.body[key];
          const updated =
            key === "name"
              ? await module.updateName(companyId, userId, value)
              : key === "email"
                ? await module.updateEmail(companyId, userId, value)
                : key === "cep"
                  ? await module.updateCep(companyId, userId, value)
                  : await module.updatePhone(companyId, userId, value);
          return reply.status(200).send(updated as never);
        },
      );
    }
  };
