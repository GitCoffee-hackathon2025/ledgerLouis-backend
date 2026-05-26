
import type { TransactionBodyType } from "./schema.js";
import type { DB } from "../../types/db.js";

import { eq, type InferInsertModel } from "drizzle-orm";
import { transactions } from "../../database/schemas/index.js";

type TransactionInsert = InferInsertModel<typeof transactions>;
export const createTransactionRepository = (db: DB) => ({

    async create(Transaction: TransactionInsert) {
        console.log("FINAL INSERT:", Transaction);
        const newTransaction = await db.insert(transactions).values(Transaction);
        return newTransaction;
    },
    async getById(id: string) {
        const transaction = await db.select().from(transactions).where(eq(transactions.id, id as any));
        return transaction[0];
    },
    async update(id: string, Transaction: TransactionInsert) {
        const updatedTransaction = await db.update(transactions).set(Transaction).where(eq(transactions.id, id as any));
        return updatedTransaction;
    },
    async delete(id: string) {
        await db.delete(transactions).where(eq(transactions.id, id as any));
    },
    async getAll() {
        const listTransactions  = await db.select().from(transactions);
        return listTransactions;
    }   
});
