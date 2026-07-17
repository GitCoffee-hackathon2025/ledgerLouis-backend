import type { FastifyPluginAsync } from "fastify";
import { createTransactionController } from "../controllers/transaction.controller.js";
import { buildTransactionModule } from "../module.js";
import { SchemaEnablesAuth } from "../../../schemas/common/auth.schema.js";
import {
  accountValueResponseSchema,
  CompanyParam,
} from "../schemas/account.schema.js";
import type { GetAccountValueRoute } from "../schemas/account.schema.js";
import { getAccountValueRoute } from "../schemas/account.schema.js";
import {
  type GetTransactionRoute,
  type CreateTransactionRoute,
  // type UpdateTransactionRoute,
  type DeleteTransactionRoute,
  IdParam,
  TransactionResponse,
  ListTransactionResponse,
  createTransactionBody,
  // updateTransactionBody,
} from "../schemas/transaction.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const transactionRoutes =
  (
    module: ReturnType<typeof buildTransactionModule>["transactionService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createTransactionController(module);

    // Buscar transação por ID no escopo da empresa
    app.get<GetTransactionRoute>(
      "/:companyId/transactions/:id",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Find company transaction by id",
          ...SchemaEnablesAuth,
          params: IdParam,
          response: {
            200: TransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company, // Adicionado erro de contexto de empresa
            ]),
          },
        },
      },
      controller.get,
    );

    // Listar transações de uma empresa específica
    app.get(
      "/:companyId/transactions",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "List company transactions",
          ...SchemaEnablesAuth,
          response: {
            200: ListTransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
            ]),
          },
        },
      },
      controller.list,
    );

    // Criar transação dentro do escopo de uma empresa
    app.post<CreateTransactionRoute>(
      "/:companyId/transactions",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Create company transaction",
          ...SchemaEnablesAuth,
          body: createTransactionBody,
          response: {
            201: TransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
            ]),
          },
        },
      },
      controller.create,
    );

    // Deletar transação no escopo da empresa
    app.delete<DeleteTransactionRoute>(
      "/:companyId/transactions/:id",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Delete company transaction",
          ...SchemaEnablesAuth,
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
    app.get<GetAccountValueRoute>(
      "/:companyId/accountValue",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Get company account value",
          ...SchemaEnablesAuth,

          params: CompanyParam,

          response: {
            200: accountValueResponseSchema,
          },
        },
      },
      controller.getAccountValue,
    );
  };
