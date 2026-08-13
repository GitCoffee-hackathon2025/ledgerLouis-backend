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

export type RegisterBodyType = Static<typeof RegisterBody>;

export const UpdateBody = Type.Object(
  { name: Name, email: Email },
  { additionalProperties: false },
);

export type UpdateBodyType = Static<typeof UpdateBody>;

// export const UploadProfileImageBody = Type.Object({
//   file: Type.String({ format: "binary" }),
// });

// export type UploadProfileImageBodyType = Static<typeof UploadProfileImageBody>;

// responses

export const UserResponse = Type.Object({
  id: IdSchema,
  name: Name,
  email: Email,
});
export type UserResponseType = Static<typeof UserResponse>;

export const UserListResponse = Type.Array(UserResponse);

export const ProfileImageResponse = Type.Object({
  userId: IdSchema,
  fileId: IdSchema,
});
export type ProfileImageResponseType = Static<typeof ProfileImageResponse>;

// route generics

export type RegisterRoute = {
  Body: RegisterBodyType;
};

export type GetMeRoute = {};

export type UpdateRoute = {
  Body: UpdateBodyType;
};

export type DeleteRoute = {};

export type UploadProfileImageRoute = {};

export type OpenProfileImageRoute = {};

export type DeleteProfileImageRoute = {};
