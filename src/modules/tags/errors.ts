export const tagErrors = {
  TAG_NOT_FOUND: [404, "Tag not found"],
  TAG_ALREADY_EXISTS: [409, "Tag already exists in this company"],
  TAG_ALREADY_LINKED: [409, "Tag is already linked to this transaction"],
  TAG_LINK_NOT_FOUND: [404, "Tag is not linked to this transaction"],
} as const;
