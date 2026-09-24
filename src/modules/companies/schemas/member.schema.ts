import { Type, type Static } from "@sinclair/typebox";

import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";
import { permissionsEnum } from "../../../domain/organization/enums.js";

// params

export const CompanyIdParam = Type.Object({
  companyId: IdSchema,
});

export const MemberParam = Type.Object({
  companyId: IdSchema,
  userId: IdSchema,
});

// query

export const ListMembersQuery = Type.Object({
  limit: Type.Optional(Type.Number({ minimum: 1, default: 20 })),
  offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
});

// bodies

export const AddMemberBody = Type.Object(
  {
    email: Type.String({ format: "email" }),
    role: Type.Union(permissionsEnum.map((p) => Type.Literal(p))),
  },
  { additionalProperties: false },
);

export const ChangeRoleBody = Type.Object(
  {
    role: Type.Union(permissionsEnum.map((p) => Type.Literal(p))),
  },
  { additionalProperties: false },
);

// responses

const RoleSchema = Type.Union([
  Type.Literal("owner"),
  Type.Literal("admin"),
  Type.Literal("viewer"),
]);

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
  cnpj: Type.String(),
  email: Type.Union([Type.String({ format: "email" }), Type.Null()]),
  cep: Type.Union([Type.String(), Type.Null()]),
  phone: Type.Union([Type.String(), Type.Null()]),
  role: RoleSchema,
  createdAt: Type.String({ format: "date-time" }),
});

export const UserCompaniesResponse = Type.Array(UserCompanyResponse);
