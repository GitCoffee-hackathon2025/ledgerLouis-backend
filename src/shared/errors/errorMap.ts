export const errorMap = {
  BAD_REQUEST: [400, "Request error"],
  EMAIL_ALREADY_EXISTS: [409, "Email already in use"],
  INVALID_CREDENTIALS: [401, "Invalid credentials"],
  INVALID_JSON: [400, "Malformed JSON body"],
  INVALID_TOKEN: [401, "Invalid token"],
  INTERNAL_ERROR: [500, "Internal server error"],
  KEY_NOT_FOUND: [500, "No signing key available"],
  UNAUTHORIZED: [401, "Unauthorized"],
  UNSUPPORTED_MEDIA_TYPE: [415, "Content-Type must be application/json"],
  VALIDATION_ERROR: [400, "Invalid input"],
  TOKEN_EXPIRED: [401, "Token expired"],
  TOKEN_NOT_FOUND: [401, "Token not found"],
  TOKEN_REUSE_DETECTED: [401, "Session compromised"],
} as const;

export type ErrorCode = keyof typeof errorMap;
