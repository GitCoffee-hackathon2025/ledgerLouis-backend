import { generateId, type ULID } from "../../../domain/shared/id.js";

export const createTransactionService = (
  repo: ReturnType<typeof import("../repositories/transaction.repository.js").createTransactionRepository>,
  ledgerService: ReturnType<typeof import("./ledger.service.js").createLedgerService>,
) => ({
  async find(id: ULID, userId: ULID) {
    return repo.findById(id);
  },

  async list() {
    return repo.list();
  },

  async create(userId: ULID, payload: any) {
    const id = generateId();
    const row = { id, ...payload };
    await repo.create(row);
    return row;
  },

  async update(id: ULID, userId: ULID, payload: any) {
    await repo.update(id, payload);
    return repo.findById(id);
  },

  async delete(id: ULID, userId: ULID) {
    await repo.delete(id);
  },
});
