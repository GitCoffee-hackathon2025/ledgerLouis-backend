export const httpErrors = {
  INVALID_JSON: [400, "Malformed JSON body"],
  UNSUPPORTED_MEDIA_TYPE: [415, "Content-Type must be application/json"],
  UNAUTHORIZED: [401, "Unauthorized"],
  FORBIDDEN: [403, "Insufficient permissions"],
} as const;