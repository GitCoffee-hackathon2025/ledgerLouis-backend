import { Type } from "@sinclair/typebox";

// =====================
// BASE TYPES
// =====================

export const ULID = Type.String({
  pattern: "^[0-9A-HJKMNP-TV-Z]{26}$",
});

export const JWT = Type.String({
  pattern: "^[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+\\.[A-Za-z0-9-_]+$",
});

// =====================
// HEADERS
// =====================

export const AuthHeader = Type.Object(
  {
    authorization: Type.String({
      pattern: "^Bearer .+$",
    }),
  },
  { additionalProperties: true },
);

// =====================
// TOKENS
// =====================

export const AccessToken = JWT;
export const RefreshToken = JWT;

// =====================
// BODIES
// =====================

export const LoginBody = Type.Object({});

export const RefreshBody = Type.Object(
  {
    refreshToken: RefreshToken,
  },
  { additionalProperties: false },
);

// =====================
// RESPONSES
// =====================

export const AuthResponse = Type.Object({
  accessToken: AccessToken,
  refreshToken: RefreshToken,
});

export const RefreshResponse = AuthResponse;

export const EmptyResponse = Type.Object({});

// =====================
// ERRORS
// =====================

export const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  message: Type.String(),
});
