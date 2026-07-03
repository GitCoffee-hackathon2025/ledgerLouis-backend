export const createLedgerService = (
  repo: ReturnType<typeof import("../repositories/ledger.repository.js").createLedgerRepository>,
) => ({
  async list(transactionId: string) {
    return repo.listByTransaction(transactionId);
  },

  async find(transactionId: string, ledgerId: string) {
    return repo.findById(ledgerId);
  },

  async create(transactionId: string, payload: any) {
    const row = { transactionId, ...payload };
    await repo.create(row);
    return row;
  },

  async update(transactionId: string, ledgerId: string, payload: any) {
    await repo.update(ledgerId, payload);
    return repo.findById(ledgerId);
  },

  async delete(transactionId: string, ledgerId: string) {
    await repo.delete(ledgerId);
  },
});
