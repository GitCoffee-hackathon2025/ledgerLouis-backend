import { generateId, type ULID } from "../../../domain/shared/id.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import type { createLedgerRepository } from "../repositories/ledger.repository.js";
import type {
  TransactionLedger,
  TransactionLedgerCreate,
  TransactionLedgerUpdate,
  TransactionLedgerListOpts,
} from "../schemas/ledger.schema.js";

export const createLedgerService = (
  repo: ReturnType<typeof createLedgerRepository>,
) => ({
  async find(id: ULID): Promise<TransactionLedger> {
    const ledger = await repo.findById(id);

    if (!ledger) {
      throw new Error("LEDGER_NOT_FOUND");
    }

    return ledger;
  },

  async list(
    opts?: TransactionLedgerListOpts,
  ): Promise<TransactionLedger[]> {
    if (opts && Object.keys(opts).length > 0) {
      return repo.listFiltered(opts);
    }

    return repo.list();
  },

  async listByTransaction(
    transactionId: ULID,
  ): Promise<TransactionLedger[]> {
    return repo.listByTransaction(transactionId);
  },

  async create(
    payload: TransactionLedgerCreate,
  ): Promise<TransactionLedger> {
    const ledger: TransactionLedger = {
      id: generateId(),
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return repo.create(
      ledger as Parameters<typeof repo.create>[0],
    );
  },

  async update(
    id: ULID,
    payload: TransactionLedgerUpdate,
  ): Promise<TransactionLedger> {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new Error("LEDGER_NOT_FOUND");
    }

    const updated = {
      ...payload,
      updatedAt: new Date(),
    };

    const result = await repo.update(id, updated);

    if (!result) {
      throw new Error("LEDGER_NOT_FOUND");
    }

    return result;
  },

  async delete(id: ULID): Promise<void> {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new Error("LEDGER_NOT_FOUND");
    }

    await repo.delete(id);
  },
});