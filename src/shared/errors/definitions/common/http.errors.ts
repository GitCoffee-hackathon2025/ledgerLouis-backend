export const httpErrors = {
  INVALID_JSON: [400, "Malformed JSON body"],
  UNSUPPORTED_MEDIA_TYPE: [415, "Content-Type must be application/json"],
  UNAUTHORIZED: [401, "Unauthorized"],
  RATE_LIMIT_EXCEEDED: [429, "Too many requests. Please try again later"],
  FORBIDDEN: [403, "Insufficient permissions"],
} as const;
