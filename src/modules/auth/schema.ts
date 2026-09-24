import { Type, type Static } from "@sinclair/typebox";

import { Email, Password } from "../../api/schemas/primitives/user.schema.js";
import {
  JwtSchema,
  JwtPattern,
} from "../../api/schemas/primitives/jwt.schema.js";

// headers
export const AuthHeader = Type.Object(
  {
    authorization: Type.String({
      pattern: `^Bearer ${JwtPattern}$`,
    }),
  },
  { additionalProperties: true },
);

// query
export const LoginQuery = Type.Object(
  { token: Type.Optional(Type.String({ minLength: 1 })) },
  { additionalProperties: false },
);

// bodies
export const LoginBody = Type.Object(
  {
    email: Email,
    password: Password,
  },
  { additionalProperties: false },
);

export const RefreshBody = Type.Object(
  {
    refreshToken: JwtSchema,
  },
  { additionalProperties: false },
);

// email verification
export const EmailVerificationResendBody = Type.Object(
  {
    email: Email,
  },
  { additionalProperties: false },
);

// route generics
export const AuthResponse = Type.Object({
  accessToken: JwtSchema,
  refreshToken: JwtSchema,
});

export const EmailVerificationResponse = Type.Object({
  email: Email,
  expiresAt: Type.String({ format: "date-time" }),
  cooldown: Type.String({ format: "date-time" }),
});
