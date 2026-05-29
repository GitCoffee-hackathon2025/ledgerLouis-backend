import { Type, type Static } from "@sinclair/typebox";
import { IdSchema } from "../../schemas/primitives/id.schema.js";
import { Name, Email, Password } from "../../schemas/primitives/user.schema.js";
import { ErrorResponse } from "../../schemas/common/error.schema.js";


// bodies
export const RegisterBody = Type.Object(
  {
    name: Name,
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);



export const UploadAvatarBody = Type.Object({
  file: Type.String({ format: "binary" }),
});


export const UploadAvatarResponse = Type.Object({
  fileId : IdSchema,
  avatarUrl: Type.String({ format: "uri" }),
  path: Type.Optional(Type.String()),
});

export type UploadAvatarBodyType = Static<typeof UploadAvatarBody>;

export const UpdateBody = Type.Object(
  {
    name: Name,
    email: Email,
  },
  { additionalProperties: false },
);
export type UpdateBodyType = Static<typeof UpdateBody>;

// responses
export const UserResponse = Type.Object({
  id: IdSchema,
  name: Name,
  email: Email,
  avatar: Type.Optional(Type.String({ format: "uri" })),
});
export const UserListResponse = Type.Array(UserResponse);

export type RegisterBodyType = Static<typeof RegisterBody>;
export type UserResponseType = Static<typeof UserResponse>;

export { ErrorResponse };
