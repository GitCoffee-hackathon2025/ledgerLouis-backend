import type { FastifyPluginAsync } from "fastify";

import { createMemberController } from "../controllers/member.controller.js";
import { buildCompanyModule } from "../module.js";

import { SchemaEnablesAuth } from "../../../api/schemas/common/auth.schema.js";

import {
  CompanyIdParam,
  MemberParam,
  ListMembersQuery,
  AddMemberBody,
  ChangeRoleBody,
  MembersListResponse,
  MemberMutationResponse,
  UserCompaniesResponse,
  type ListMembersRoute,
  type AddMemberRoute,
  type ChangeMemberRoleRoute,
  type RemoveMemberRoute,
} from "../schemas/member.schema.js";

import { createErrorResponses } from "../../../shared/errors/schemas/responses.js";
import { routeGroups } from "../../../shared/errors/domain/groups.js";

export const memberRoutes =
  (
    module: ReturnType<typeof buildCompanyModule>["memberService"],
  ): FastifyPluginAsync =>
  async (app) => {
    const controller = createMemberController(module);

    app.get<ListMembersRoute>(
      "/companies/:companyId/members",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["members"],
          summary: "List company members",
          ...SchemaEnablesAuth,
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
      controller.list,
    );

    app.post<AddMemberRoute>(
      "/companies/:companyId/members",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["members"],
          summary: "Add company member",
          ...SchemaEnablesAuth,
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
      controller.add,
    );

    app.patch<ChangeMemberRoleRoute>(
      "/companies/:companyId/members/:userId",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["members"],
          summary: "Change member role",
          ...SchemaEnablesAuth,
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
      controller.changeRole,
    );

    app.delete<RemoveMemberRoute>(
      "/companies/:companyId/members/:userId",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["members"],
          summary: "Remove company member",
          ...SchemaEnablesAuth,
          params: MemberParam,
          response: {
            204: { type: "null" },
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
      controller.remove,
    );

    app.get(
      "/me/companies",
      {
        preHandler: app.verifyAccess,
        schema: {
          tags: ["members"],
          summary: "List companies of authenticated user",
          ...SchemaEnablesAuth,
          response: {
            200: UserCompaniesResponse,
            ...createErrorResponses([
              ...routeGroups.common,
              ...routeGroups.auth,
            ]),
          },
        },
      },
      controller.listUserCompanies,
    );
  };
