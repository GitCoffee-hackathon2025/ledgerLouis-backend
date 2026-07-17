export const httpErrors = {
  UNAUTHORIZED: [401, "Unauthorized"],
  RATE_LIMIT_EXCEEDED: [429, "Too many requests. Please try again later"],
  FORBIDDEN: [403, "Insufficient permissions"],
} as const;
