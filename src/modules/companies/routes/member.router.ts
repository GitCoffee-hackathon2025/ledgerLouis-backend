import type { FastifyPluginAsyncTypebox } from "@fastify/type-provider-typebox";
import { buildCompanyModule } from "../module.js";
import { toId } from "../../../domain/shared/id.js";

import {
  CompanyIdParam,
  MemberParam,
  ListMembersQuery,
  AddMemberBody,
  ChangeRoleBody,
  MembersListResponse,
  MemberMutationResponse,
  UserCompaniesResponse,
} from "../schemas/member.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const memberRoutes =
  (
    module: ReturnType<typeof buildCompanyModule>["memberService"],
  ): FastifyPluginAsyncTypebox =>
  async (app) => {
    app.get(
      "/companies/:companyId/members",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["members"],
          summary: "List company members",
          params: CompanyIdParam,
          querystring: ListMembersQuery,
          response: {
            200: MembersListResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.member,
            ]),
          },
        },
      },
      async (req, reply) => {
        const result = await module.findAllMember(
          req.authUser.sub,
          toId(req.params.companyId),
          req.query.limit,
          req.query.offset,
        );

        return reply.status(200).send({
          ...result,
          items: result.items.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        });
      },
    );

    app.post(
      "/companies/:companyId/members",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["members"],
          summary: "Add company member",
          params: CompanyIdParam,
          body: AddMemberBody,
          response: {
            201: MemberMutationResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.member,
              ...routeGroups.user,
            ]),
          },
        },
      },
      async (req, reply) =>
        reply
          .status(201)
          .send(
            await module.addMember(
              req.authUser.sub,
              toId(req.params.companyId),
              req.body.email,
              req.body.role,
            ),
          ),
    );

    app.patch(
      "/companies/:companyId/members/:userId",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["members"],
          summary: "Change member role",
          params: MemberParam,
          body: ChangeRoleBody,
          response: {
            200: MemberMutationResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.form,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.member,
            ]),
          },
        },
      },
      async (req, reply) =>
        reply
          .status(200)
          .send(
            await module.changeMemberRole(
              req.authUser.sub,
              toId(req.params.companyId),
              toId(req.params.userId),
              req.body.role,
            ),
          ),
    );

    app.delete(
      "/companies/:companyId/members/:userId",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["members"],
          summary: "Remove company member",
          params: MemberParam,
          response: {
            204: {},
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
              ...routeGroups.permission,
              ...routeGroups.company,
              ...routeGroups.member,
            ]),
          },
        },
      },
      async (req, reply) => {
        await module.removeMember(
          req.authUser.sub,
          toId(req.params.companyId),
          toId(req.params.userId),
        );
        return reply.status(204).send();
      },
    );

    app.get(
      "/me/companies",
      {
        preHandler: app.verifyAccess,
        config: { auth: true },
        schema: {
          tags: ["members"],
          summary: "List companies of authenticated user",
          response: {
            200: UserCompaniesResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      async (req, reply) => {
        const result = await module.findUserList(req.authUser.sub);

        return reply.status(200).send(
          result.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          })),
        );
      },
    );
  };
