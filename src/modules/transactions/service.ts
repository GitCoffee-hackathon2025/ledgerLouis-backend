
import { createTransactionRepository } from "./repository.js";
import type { TransactionBodyType } from "./schema.js";


export const createTransactionService = (repo: ReturnType<typeof createTransactionRepository>) => ({
    async register(Transaction: Omit<TransactionBodyType, 'id'>) {
        console.log("Registering Transaction with data:", Transaction);
        const newTransaction = await repo.create(Transaction as any);
        return newTransaction;
    },  
    async getById(id: string) {
        const transaction = await repo.getById(id);
        return transaction;
    },
    async update(id: string, Transaction: TransactionBodyType) {
        const updatedTransaction = await repo.update(id, Transaction as any);
        return updatedTransaction;
    },
    async delete(id: string) {
        await repo.delete(id);
    },
    async getAll() {
        const transactions = await repo.getAll();
        return transactions;
    }
});