import { Type } from "@sinclair/typebox";

import { DateTime } from "../../../api/schemas/primitives/date.schema.js";
import { IdSchema } from "../../../api/schemas/primitives/id.schema.js";
import { Email } from "../../../api/schemas/primitives/user.schema.js";

// primitives

const InvitationRole = Type.Union([
  Type.Literal("owner"),
  Type.Literal("admin"),
  Type.Literal("viewer"),
]);

const InvitationToken = Type.String({ minLength: 1 });

const Invitation = {
  id: IdSchema,
  email: Email,
  role: InvitationRole,
  expiresAt: DateTime,
};

// params

export const CompanyInvitationParams = Type.Object(
  { companyId: IdSchema },
  { additionalProperties: false },
);

export const CompanyInvitationIdParams = Type.Object(
  { companyId: IdSchema, invitationId: IdSchema },
  { additionalProperties: false },
);

export const InvitationTokenParams = Type.Object(
  { token: InvitationToken },
  { additionalProperties: false },
);

export const UserInvitationIdParams = Type.Object(
  { invitationId: IdSchema },
  { additionalProperties: false },
);

// query

export const ListInvitationsQuery = Type.Object({
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  offset: Type.Optional(Type.Number({ minimum: 0, default: 0 })),
});

// bodies

export const CreateInvitationBody = Type.Object(
  { email: Email, role: InvitationRole },
  { additionalProperties: false },
);

// responses

export const InvitationResponse = Type.Object({
  ...Invitation,
  companyId: IdSchema,
});

export const InvitationDetailsResponse = Type.Object({
  companyId: IdSchema,
  email: Email,
  role: InvitationRole,
  expiresAt: DateTime,
});

export const InvitationAcceptanceResponse = Type.Object({
  companyId: IdSchema,
  userId: IdSchema,
  role: InvitationRole,
});

export const UserInvitationsListResponse = Type.Object({
  items: Type.Array(Type.Object({
    ...Invitation,
    companyId: IdSchema,
  })),
});

export const InvitationsListResponse = Type.Object({
  companyId: IdSchema,
  items: Type.Array(Type.Object(Invitation)),
  total: Type.Number(),
  limit: Type.Number(),
  offset: Type.Number(),
});
