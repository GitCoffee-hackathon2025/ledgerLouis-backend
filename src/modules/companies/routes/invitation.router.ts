import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";

import { buildCompanyModule } from "../module.js";

import {
  InvitationAcceptanceResponse,
  UserInvitationIdParams,
  UserInvitationsListResponse,
} from "../schemas/invitation.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";
import { toId } from "../../../domain/shared/id.js";

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
          summary: "List invitations",
          response: {
            200: UserInvitationsListResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.user,
            ]),
          },
        },
      },
      async (req, res) => {
        return res
          .status(200)
          .send(await invitation.listByUser(req.authUser.sub));
      },
    );

    app.post(
      "/:invitationId/accept",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["invitations"],
          summary: "Accept invitation by ID",
          params: UserInvitationIdParams,
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
      async (req, res) => {
        return res
          .status(200)
          .send(
            await invitation.acceptById(
              req.authUser.sub,
              toId(req.params.invitationId),
            ),
          );
      },
    );
  };
