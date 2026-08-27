import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import { buildCompanyModule } from "../module.js";

import {
  InvitationTokenParams,
  InvitationDetailsResponse,
  InvitationAcceptanceResponse,
} from "../schemas/invitation.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const invitationRoutes =
  (
    invitation: ReturnType<typeof buildCompanyModule>["invitationService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.get(
      "/",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["invitations"],
          summary: "Get invitation details",
          params: InvitationTokenParams,
          response: {
            200: InvitationDetailsResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
              ...routeGroups.invitation,
              ...routeGroups.permission,
            ]),
          },
        },
      },
      async (req, reply) => {
        return reply
          .status(200)
          .send(await invitation.read(req.authUser.sub, req.params.token));
      },
    );

    app.post(
      "/accept",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["invitations"],
          summary: "Accept invitation",
          params: InvitationTokenParams,
          response: {
            200: InvitationAcceptanceResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
              ...routeGroups.member,
              ...routeGroups.invitation,
            ]),
          },
        },
      },
      async (req, reply) => {
        return reply
          .status(200)
          .send(await invitation.accept(req.authUser.sub, req.params.token));
      },
    );
  };
