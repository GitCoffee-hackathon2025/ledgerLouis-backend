import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import { buildCompanyModule } from "../module.js";

import {
  CompanyInvitationParams,
  CompanyInvitationIdParams,
  ListInvitationsQuery,
  CreateInvitationBody,
  InvitationResponse,
  InvitationsListResponse,
} from "../schemas/invitation.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import { toId } from "../../../domain/shared/id.js";

export const companyInvitationRoutes =
  (
    invitation: ReturnType<typeof buildCompanyModule>["invitationService"],
    invitationUrl: string,
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.post(
      "/",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["invitations"],
          summary: "Create company invitation",
          params: CompanyInvitationParams,
          body: CreateInvitationBody,
          response: {
            201: InvitationResponse,

            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.user,
              ...routeGroups.invitation,
              "MEMBER_ALREADY_EXISTS",
            ]),
          },
        },
      },
      async (req, reply) => {
        const { companyId } = req.params;
        const { email, role } = req.body;

        return reply
          .status(201)
          .send(
            await invitation.create(
              req.authUser.sub,
              toId(companyId),
              email,
              role,
              invitationUrl,
            ),
          );
      },
    );

    app.get(
      "/",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["invitations"],
          summary: "List company invitations",
          params: CompanyInvitationParams,
          querystring: ListInvitationsQuery,
          response: {
            200: InvitationsListResponse,

            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.invitation,
            ]),
          },
        },
      },
      async (req, reply) => {
        return reply
          .status(200)
          .send(
            await invitation.list(
              req.authUser.sub,
              toId(req.params.companyId),
              req.query.limit,
              req.query.offset,
            ),
          );
      },
    );

    app.delete(
      "/:invitationId",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["invitations"],
          summary: "Revoke company invitation",
          params: CompanyInvitationIdParams,
          response: {
            204: { type: "null" },

            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.invitation,
            ]),
          },
        },
      },
      async (req, reply) => {
        await invitation.revoke(
          req.authUser.sub,
          toId(req.params.companyId),
          toId(req.params.invitationId),
        );

        return reply.status(204);
      },
    );
  };
