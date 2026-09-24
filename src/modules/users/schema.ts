import { Type, type Static } from "@sinclair/typebox";

import { IdSchema } from "../../api/schemas/primitives/id.schema.js";
import {
  Email,
  Name,
  Password,
} from "../../api/schemas/primitives/user.schema.js";

// bodies

export const RegisterBody = Type.Object(
  { name: Name, email: Email, password: Password },
  { additionalProperties: false },
);

export const UpdateBody = Type.Object(
  { name: Name, email: Email },
  { additionalProperties: false },
);

// responses

export const UserResponse = Type.Object({
  id: IdSchema,
  name: Name,
  email: Email,
});

export const RegistedUserResponse = Type.Intersect([
  UserResponse,
  Type.Object({
    expiresAt: Type.String({ format: "date-time" }),
    cooldown: Type.String({ format: "date-time" }),
  }),
]);

export const UserListResponse = Type.Array(UserResponse);

export const ProfileImageResponse = Type.Object({
  userId: IdSchema,
  fileId: IdSchema,
});
