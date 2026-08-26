import type { FastifyPluginAsync } from "fastify";
import type { buildTagModule } from "../module.js";
import { createTagController } from "../controllers/tag.controller.js";
import {
  TagResponse,
  TagsListResponse,
  CompanyIdParam,
  TagIdParam,
  CreateTagBody,
  UpdateTagBody,
  type GetTagRoute,
  type ListTagsRoute,
  type CreateTagRoute,
  type UpdateTagRoute,
  type DeleteTagRoute,
} from "../schemas/tag.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const tagRoutes =
  (
    module: ReturnType<typeof buildTagModule>["tagService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createTagController(module);

    // Buscar tag por id no escopo da empresa
    app.get<GetTagRoute>(
      "/:companyId/tags/:id",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "Find company tag by id",
          params: TagIdParam,
          response: {
            200: TagResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.tag,
            ]),
          },
        },
      },
      controller.get,
    );

    // Listar tags de uma empresa
    app.get<ListTagsRoute>(
      "/:companyId/tags",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "List company tags",
          params: CompanyIdParam,
          response: {
            200: TagsListResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
            ]),
          },
        },
      },
      controller.list,
    );

    // Criar tag no escopo da empresa
    app.post<CreateTagRoute>(
      "/:companyId/tags",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "Create company tag",
          params: CompanyIdParam,
          body: CreateTagBody,
          response: {
            201: TagResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              "TAG_ALREADY_EXISTS",
            ]),
          },
        },
      },
      controller.create,
    );

    // Atualizar (renomear) tag no escopo da empresa
    app.patch<UpdateTagRoute>(
      "/:companyId/tags/:id",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "Update company tag",
          params: TagIdParam,
          body: UpdateTagBody,
          response: {
            200: TagResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.tag,
              "TAG_ALREADY_EXISTS",
            ]),
          },
        },
      },
      controller.update,
    );

    // Deletar tag no escopo da empresa
    app.delete<DeleteTagRoute>(
      "/:companyId/tags/:id",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "Delete company tag",
          params: TagIdParam,
          response: {
            204: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.tag,
            ]),
          },
        },
      },
      controller.delete,
    );
  };
