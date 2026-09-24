import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { buildCompanyModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";
import {
  CompaniesListResponse,
  CompanyResponse,
  CreateBody,
  CompanyIdParam,
} from "../schemas/company.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const companyRoutes =
  (
    module: ReturnType<typeof buildCompanyModule>["company"]["companyService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.get(
      "/:companyId",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["companies"],
          summary: "Find company by id",
          params: CompanyIdParam,
          response: {
            200: CompanyResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.member,
              ...routeGroups.company,
            ]),
          },
        },
      },
      async (req, reply) =>
        reply
          .status(200)
          .send(await module.find(toId(req.params.companyId), req.authUser.sub)),
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
      async (_req, reply) => reply.status(200).send(await module.list()),
    );

    app.post(
      "/",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["companies"],
          summary: "Create company",
          body: CreateBody,
          response: {
            201: CompanyResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
            ]),
          },
        },
      },
      async (req, reply) => {
        const { name, cnpj, email, cep, phone } = req.body;
        return reply.status(201).send(
          await module.create(req.authUser.sub, {
            name,
            cnpj,
            email,
            cep,
            phone,
          }),
        );
      },
    );

    app.delete(
      "/:companyId",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["companies"],
          summary: "Delete company",
          params: CompanyIdParam,
          response: {
            204: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.member,
              ...routeGroups.company,
            ]),
          },
        },
      },
      async (req, reply) => {
        await module.delete(toId(req.params.companyId), req.authUser.sub);
        return reply.status(204).send();
      },
    );
  };
