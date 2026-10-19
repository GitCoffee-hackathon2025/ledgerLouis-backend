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
    invitation: ReturnType<
      typeof buildCompanyModule
    >["invitation"]["invitationUserService"],
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
              "INVALID_TOKEN",
              "TOKEN_EXPIRED",
              "UNAUTHORIZED",
              "USER_NOT_FOUND",
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
              ...routeGroups.form,
              "INVALID_TOKEN",
              "TOKEN_EXPIRED",
              "UNAUTHORIZED",
              "USER_NOT_FOUND",
              "MEMBER_ALREADY_EXISTS",
              "INVITATION_EXPIRED",
              "INVITATION_NOT_FOUND",
              "INVITATION_ALREADY_ACCEPTED",
              "INVITATION_REVOKED",
              "INVITATION_EMAIL_MISMATCH",
            ]),
          },
        },
      },
      async (req, res) => {
        return res.status(200).send(
          await invitation.accept(req.authUser.sub, {
            by: "id",
            value: toId(req.params.invitationId),
          }),
        );
      },
    );
  };
