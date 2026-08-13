export const commonErrors = {
  BAD_REQUEST: [400, "Request error"],
  VALIDATION_ERROR: [400, "Invalid input"],
  INVALID_JSON: [400, "Malformed JSON body"],
  INTERNAL_ERROR: [500, "Internal server error"],
  UNSUPPORTED_MEDIA_TYPE: [415, "Content-Type must be application/json"],
} as const;
