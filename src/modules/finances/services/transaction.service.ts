import { generateId, toId, type ULID } from "../../../domain/shared/id.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import type { TransactionLedgerBody, TransactionLedgerBodyType} from "../schemas/transaction.schema.js";
import type { createTransactionRepository } from "../repositories/transaction.repository.js";
import type { createLedgerService } from "./ledger.service.js";
import type {
  TransactionLedgerCreate,
  TransactionLedgerUpdate,
} from "../schemas/ledger.schema.js";

export const createTransactionService = (
  repo: ReturnType<typeof createTransactionRepository>,
  ledgerService: ReturnType<typeof createLedgerService>,
) => ({
  async find(id: ULID, userId: ULID) {
    const tx = await repo.findById(id);

    if (!tx) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    const ledgers = await ledgerService.listByTransaction(id);

    return {
      ...tx,
      ledgers,
    };
  },

  async list(userId: ULID, opts?: { projectId?: ULID }) {
    if (opts?.projectId) {
      const all = await repo.list();
      return all.filter((t: any) => t.projectId === opts.projectId);
    }

    return repo.list();
  },

  async create(userId: ULID, payload: TransactionLedgerBodyType) {

    const row = {
  ...payload,
  id: generateId(),
    companyId: toId(payload.companyId),
  projectId: toId(payload.projectId),
  createdBy: userId,
  updatedBy: userId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

    await repo.create(row);
    return {
      ...row,
    };
  },
/*
  async update(id: ULID, userId: ULID, payload: TransactionLedgerBodyType) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new AppError("TRANSACTION_NOT_FOUND");
    }

    const updated = {
      ...existing,
      ...payload,
      id: generateId(),
    companyId: toId(payload.companyId),
    projectId: toId(payload.projectId),
    createdBy: userId,
    updatedBy: userId,
     updatedAt: new Date().toISOString(),
    };

    await repo.update(id, updated);


    return {
      ...(await repo.findById(id)),
      ledgers: await ledgerService.listByTransaction(id),
    };
  },
*/
  async delete(id: ULID, userId: ULID) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new Error("TRANSACTION_NOT_FOUND");
    }

    const ledgers = await ledgerService.listByTransaction(id);

    for (const ledger of ledgers) {
      await ledgerService.delete(ledger.id);
    }

    await repo.delete(id);
  },
});