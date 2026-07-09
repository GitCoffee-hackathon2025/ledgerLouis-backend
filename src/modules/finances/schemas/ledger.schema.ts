
import type { ULID } from "../../../domain/shared/id.js";
export interface TransactionLedger {
  id: ULID;
  companyId: ULID;
  transactionId: ULID;
  accountId: ULID;
  entryType: string; // "debit" | "credit"
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionLedgerCreate {
  companyId: ULID;
  transactionId: ULID;
  accountId: ULID;
  entryType: string;
  amount: number;
}

export interface TransactionLedgerUpdate {
  accountId?: ULID;
  entryType?: string;
  amount?: number;
}

export type TransactionLedgerListOpts = {
  transactionId?: ULID;
  companyId?: ULID;
  accountId?: ULID;
  entryType?: string;
};

// Fastify Route Types
import type { FastifyRequest, FastifyReply } from "fastify";

export interface CreateLedgerRoute {
  Params: { transactionId: string };
  Body: TransactionLedgerCreate;
  Reply: TransactionLedger;
}

export interface UpdateLedgerRoute {
  Params: { transactionId: string; ledgerId: string };
  Body: TransactionLedgerUpdate;
  Reply: TransactionLedger;
}

export interface GetLedgerRoute {
  Params: { transactionId: string; ledgerId: string };
  Reply: TransactionLedger;
}

export interface ListLedgerRoute {
  Params: { transactionId: string };
  Reply: TransactionLedger[];
}

export interface DeleteLedgerRoute {
  Params: { transactionId: string; ledgerId: string };
}