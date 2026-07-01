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

// Route generics

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
