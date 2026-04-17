import { Type } from "@sinclair/typebox";

export const ULID = Type.String({
  pattern: "^[0-9A-HJKMNP-TV-Z]{26}$",
});

export const Email = Type.String({
  format: "email",
});

export const Password = Type.String({
  minLength: 8,
  maxLength: 72,
});

export const Name = Type.String({
  minLength: 3,
  maxLength: 100,
});

export const RegisterBody = Type.Object(
  {
    name: Name,
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

export const LoginBody = Type.Object(
  {
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

export const UserResponse = Type.Object({
  id: ULID,
  name: Name,
  email: Email,
});

export const AuthResponse = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
});

export const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  message: Type.String(),
});
