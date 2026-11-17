export const investmentErrors = {
  ASSET_NOT_FOUND: [404, "Asset not found"],
  INVESTMENT_GROUP_NOT_FOUND: [404, "Sector or niche not found"],
  PROPOSAL_NOT_FOUND: [404, "Proposal not found"],
  PROPOSAL_ITEM_NOT_FOUND: [404, "Proposal item not found"],
  PENDING_CHANGE_NOT_FOUND: [404, "Pending change not found"],
  // O motivo, em português, vai no campo "detail"
  INVESTMENT_INVALID: [400, "Invalid investment data"],
} as const;
