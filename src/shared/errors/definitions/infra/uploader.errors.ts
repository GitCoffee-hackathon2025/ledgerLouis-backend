export const uploaderErrors = {
  FILE_REQUIRED: [400, "File is required"],
  INVALID_FILE_TYPE: [400, "Invalid file type"],
  FILE_TOO_LARGE: [413, "File is too large"],
  FILE_NOT_FOUND: [404, "File not found"],
  UPLOAD_FAILED: [500, "Failed to upload file"],
} as const;
