import { Type, type Static } from "@sinclair/typebox";

import { IdSchema } from "../../../schemas/primitives/id.schema.js";
import { permissionsEnum } from "../../../shared/enums/index.js";

// params

export const CompanyIdParam = Type.Object({
  companyId: IdSchema,
});

export type CompanyIdParamType = Static<typeof CompanyIdParam>;

export const MemberParam = Type.Object({
  companyId: IdSchema,
  userId: IdSchema,
});

export type MemberParamType = Static<typeof MemberParam>;

// query

export const ListMembersQuery = Type.Object({
  limit: Type.Optional(Type.Number({ minimum: 1, default: 20 })),
  offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
});

export type ListMembersQueryType = Static<typeof ListMembersQuery>;

// bodies

export const AddMemberBody = Type.Object(
  {
    email: Type.String({ format: "email" }),
    role: Type.Union(permissionsEnum.map((p) => Type.Literal(p))),
  },
  { additionalProperties: false },
);

export type AddMemberBodyType = Static<typeof AddMemberBody>;

export const ChangeRoleBody = Type.Object(
  {
    role: Type.Union(permissionsEnum.map((p) => Type.Literal(p))),
  },
  { additionalProperties: false },
);

export type ChangeRoleBodyType = Static<typeof ChangeRoleBody>;

// responses

const RoleSchema = Type.Union(
  permissionsEnum.map((permission) => Type.Literal(permission)),
);

export const MemberResponse = Type.Object({
  userId: IdSchema,
  name: Type.String(),
  email: Type.String({ format: "email" }),
  role: RoleSchema,
  createdAt: Type.String({ format: "date-time" }),
});

export const MembersListResponse = Type.Object({
  items: Type.Array(MemberResponse),
  total: Type.Number(),
  limit: Type.Number(),
  offset: Type.Number(),
});

export const MemberMutationResponse = Type.Object({
  targetUserId: IdSchema,
  companyId: IdSchema,
  role: RoleSchema,
});

export const UserCompanyResponse = Type.Object({
  companyId: IdSchema,
  companyName: Type.String(),
  role: RoleSchema,
  createdAt: Type.String({ format: "date-time" }),
});

export const UserCompaniesResponse = Type.Array(UserCompanyResponse);

// route generics

export type ListMembersRoute = {
  Params: CompanyIdParamType;
  Querystring: ListMembersQueryType;
};

export type AddMemberRoute = {
  Params: CompanyIdParamType;
  Body: AddMemberBodyType;
};

export type ChangeMemberRoleRoute = {
  Params: MemberParamType;
  Body: ChangeRoleBodyType;
};

export type RemoveMemberRoute = {
  Params: MemberParamType;
};

export type ListUserCompaniesRoute = {};
