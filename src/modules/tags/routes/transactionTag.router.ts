import type { FastifyPluginAsync } from "fastify";
import type { buildTagModule } from "../module.js";
import { createTransactionTagController } from "../controllers/transactionTag.controller.js";
import {
  TransactionParam,
  TransactionTagParam,
  AttachTagBody,
  TransactionTagLinkResponse,
  type ListTransactionTagsRoute,
  type AttachTagRoute,
  type DetachTagRoute,
} from "../schemas/transactionTag.schema.js";
import { TagsListResponse } from "../schemas/tag.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const transactionTagRoutes =
  (
    module: ReturnType<typeof buildTagModule>["transactionTagService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createTransactionTagController(module);

    // Listar tags vinculadas a uma transação
    app.get<ListTransactionTagsRoute>(
      "/:companyId/transactions/:transactionId/tags",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "List tags linked to a transaction",
          params: TransactionParam,
          response: {
            200: TagsListResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.transaction,
            ]),
          },
        },
      },
      controller.list,
    );

    // Vincular uma tag existente a uma transação
    app.post<AttachTagRoute>(
      "/:companyId/transactions/:transactionId/tags",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "Attach a tag to a transaction",
          params: TransactionParam,
          body: AttachTagBody,
          response: {
            201: TransactionTagLinkResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.transaction,
              ...routeGroups.tag,
              "TAG_ALREADY_LINKED",
            ]),
          },
        },
      },
      controller.attach,
    );

    // Desvincular uma tag de uma transação
    app.delete<DetachTagRoute>(
      "/:companyId/transactions/:transactionId/tags/:tagId",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["tags"],
          summary: "Detach a tag from a transaction",
          params: TransactionTagParam,
          response: {
            204: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.transaction,
              "TAG_LINK_NOT_FOUND",
            ]),
          },
        },
      },
      controller.detach,
    );
  };
