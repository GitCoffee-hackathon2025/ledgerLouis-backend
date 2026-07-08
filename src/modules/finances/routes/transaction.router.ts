import type { FastifyPluginAsync } from "fastify";
import { createTransactionController } from "../controllers/transaction.controller.js";
import { buildTransactionModule } from "../module.js";
import { SchemaEnablesAuth } from "../../../schemas/common/auth.schema.js";
import {
  type GetTransactionRoute,
  type CreateTransactionRoute,
  type UpdateTransactionRoute,
  type DeleteTransactionRoute,

  IdParam,
  TransactionResponse,
  ListTransactionResponse,
  createTransactionBody,
  updateTransactionBody,
} from "../schemas/transaction.schema.js";

import {
  createErrorResponses,
  routeGroups,
} from "../../../shared/errors/schemas/responses.js";

export const transactionRoutes =
  (
    module: ReturnType<typeof buildTransactionModule>["transactionService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createTransactionController(module);

    app.get<GetTransactionRoute>(
      "/:id",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Find transaction by id",
          ...SchemaEnablesAuth,
          params: IdParam,
          response: {
            200: TransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
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
          tags: ["transactions"],
          summary: "List transactions",
          ...SchemaEnablesAuth,
          response: {
            200: ListTransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.list,
    );

    app.post<CreateTransactionRoute>(
      "/",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Create transaction",
          ...SchemaEnablesAuth,
          body: createTransactionBody,
          response: {
            201: TransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.create,
    );

    app.patch<UpdateTransactionRoute>(
      "/:id",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Update transaction",
          ...SchemaEnablesAuth,
          params: IdParam,
          body: updateTransactionBody,
          response: {
            200: TransactionResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.update,
    );

    app.delete<DeleteTransactionRoute>(
      "/:id",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["transactions"],
          summary: "Delete transaction",
          ...SchemaEnablesAuth,
          params: IdParam,
          response: {
            204: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.delete,
    );


 

    
  };
