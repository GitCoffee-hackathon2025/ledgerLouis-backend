import type { FastifyPluginAsync } from "fastify";
import type { buildTransactionModule } from "../module.js";
import { createRecurringTransactionController } from "../controllers/recurringTransaction.controller.js";
import {
  RecurringResponse,
  RecurringListResponse,
  RunRecurringResponse,
  CompanyIdParam,
  RecurringIdParam,
  CreateRecurringBody,
  UpdateRecurringBody,
  type GetRecurringRoute,
  type ListRecurringRoute,
  type CreateRecurringRoute,
  type UpdateRecurringRoute,
  type DeleteRecurringRoute,
  type RunRecurringRoute,
} from "../schemas/recurringTransaction.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const recurringTransactionRoutes =
  (
    module: ReturnType<typeof buildTransactionModule>["recurringTransactionService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createRecurringTransactionController(module);

    app.get<GetRecurringRoute>(
      "/:companyId/recurring-transactions/:id",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["recurring-transactions"],
          summary: "Find recurring transaction by id",
          params: RecurringIdParam,
          response: {
            200: RecurringResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.recurringTransaction,
            ]),
          },
        },
      },
      controller.get,
    );

    app.get<ListRecurringRoute>(
      "/:companyId/recurring-transactions",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["recurring-transactions"],
          summary: "List company recurring transactions",
          params: CompanyIdParam,
          response: {
            200: RecurringListResponse,
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

    app.post<CreateRecurringRoute>(
      "/:companyId/recurring-transactions",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["recurring-transactions"],
          summary: "Create recurring transaction",
          params: CompanyIdParam,
          body: CreateRecurringBody,
          response: {
            201: RecurringResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.recurringTransaction,
            ]),
          },
        },
      },
      controller.create,
    );

    app.patch<UpdateRecurringRoute>(
      "/:companyId/recurring-transactions/:id",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["recurring-transactions"],
          summary: "Update recurring transaction (incl. pause/resume via status)",
          params: RecurringIdParam,
          body: UpdateRecurringBody,
          response: {
            200: RecurringResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.permission,
              ...routeGroups.recurringTransaction,
            ]),
          },
        },
      },
      controller.update,
    );

    app.delete<DeleteRecurringRoute>(
      "/:companyId/recurring-transactions/:id",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["recurring-transactions"],
          summary: "Delete recurring transaction",
          params: RecurringIdParam,
          response: {
            204: { type: "null" },
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.permission,
              ...routeGroups.recurringTransaction,
            ]),
          },
        },
      },
      controller.delete,
    );

    app.post<RunRecurringRoute>(
      "/:companyId/recurring-transactions/:id/run",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["recurring-transactions"],
          summary: "Manually materialize due occurrences now",
          params: RecurringIdParam,
          response: {
            200: RunRecurringResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.permission,
              ...routeGroups.recurringTransaction,
            ]),
          },
        },
      },
      controller.run,
    );
  };
