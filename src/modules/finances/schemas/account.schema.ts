
import type { ULID } from "../../../domain/shared/id.js";

export type AccountType = "asset" | "expense" | "revenue"
export interface account {
  id: ULID;
  companyId: ULID;
  name: string;
  value: string;
  type: AccountType;
  createdAt: Date;
  updatedAt: Date;
}

export interface accountCreate {
  companyId: ULID;
  name: string;
  value: string;
  type: AccountType;
}

export interface accountUpdate {
  name?: string;
  value?: string;
  type?: AccountType;
}