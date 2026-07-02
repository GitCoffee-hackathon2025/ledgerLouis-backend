import { Type, type Static } from "@sinclair/typebox";

import { IdSchema } from "../../schemas/primitives/id.schema.js";
import { Email, Name, Password } from "../../schemas/primitives/user.schema.js";

// bodies

export const RegisterBody = Type.Object(
  {
    name: Name,
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

export type RegisterBodyType = Static<typeof RegisterBody>;

export const UpdateBody = Type.Object(
  {
    name: Name,
    email: Email,
  },
  { additionalProperties: false },
);

export type UpdateBodyType = Static<typeof UpdateBody>;

export const UploadAvatarBody = Type.Object({
  file: Type.String({ format: "binary" }),
});

export type UploadAvatarBodyType = Static<typeof UploadAvatarBody>;

// responses

export const UserResponse = Type.Object({
  id: IdSchema,
  name: Name,
  email: Email,
  avatar: Type.Optional(Type.String({ format: "uri" })),
});

export type UserResponseType = Static<typeof UserResponse>;

export const UserListResponse = Type.Array(UserResponse);

export const UploadAvatarResponse = Type.Object({
  fileId: IdSchema,
  avatarUrl: Type.String({ format: "uri" }),
  path: Type.Optional(Type.String()),
});

// route generics

export type RegisterRoute = {
  Body: RegisterBodyType;
};

export type UpdateRoute = {
  Body: UpdateBodyType;
};

export type UploadAvatarRoute = {};

export type ListRoute = {};

export type DeleteRoute = {};

export type GetMeRoute = {};
