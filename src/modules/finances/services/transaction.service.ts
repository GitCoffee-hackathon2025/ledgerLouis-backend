import { generateId, type ULID } from "../../../domain/shared/id.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
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
      throw new AppError("TRANSACTION_NOT_FOUND");
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

  async create(userId: ULID, payload: any) {
    const now = new Date().toISOString();

    const row = {
      id: generateId(),
      ...payload,
      createdBy: userId,
      updatedBy: userId,
      createdAt: now,
      updatedAt: now,
    };

    await repo.create(row);

    for (const ledger of payload.ledgers ?? []) {
      await ledgerService.create({
        ...ledger,
        transactionId: row.id,
      });
    }

    return {
      ...row,
      ledgers: await ledgerService.listByTransaction(row.id),
    };
  },

  async update(id: ULID, userId: ULID, payload: any) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new AppError("TRANSACTION_NOT_FOUND");
    }

    const updated = {
      ...existing,
      ...payload,
      updatedBy: userId,
      updatedAt: new Date().toISOString(),
    };

    await repo.update(id, updated);

    for (const ledger of payload.ledgers ?? []) {
      if (ledger.id) {
        await ledgerService.update(ledger.id, ledger);
      } else {
        await ledgerService.create({
          ...ledger,
          transactionId: id,
        });
      }
    }

    return {
      ...(await repo.findById(id)),
      ledgers: await ledgerService.listByTransaction(id),
    };
  },

  async delete(id: ULID, userId: ULID) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new AppError("TRANSACTION_NOT_FOUND");
    }

    const ledgers = await ledgerService.listByTransaction(id);

    for (const ledger of ledgers) {
      await ledgerService.delete(ledger.id);
    }

    await repo.delete(id);
  },
});