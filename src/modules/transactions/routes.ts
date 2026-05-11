import type { FastifyReply, FastifyRequest } from "fastify";
import { buildTransactionModule } from "./module.js";
import type { TransactionBodyType } from "./schema.js";

export const buildTransactionRoutes = (
    transaction: ReturnType<typeof buildTransactionModule>) => ({
        async register(
            req: FastifyRequest<{ Body: TransactionBodyType }>,
            reply: FastifyReply
        ) {
            try {
                const transactionData = req.body;
                const createdTransaction = await transaction.transactionService.register(transactionData);
                return reply.status(201).send(createdTransaction);
            }
            catch (error) {
                return reply.status(400).send({ error: "Failed to register transaction", details: error instanceof Error ? error.message : String(error) })
            };
        },
        async getAll(
            reply: FastifyReply
        ) {
            try {
                const transactions = await transaction.transactionService.getAll();
                return reply.status(200).send(transactions);
            }
            catch (error) {
                return reply.status(400).send({ error: "Failed to get transactions", details: error instanceof Error ? error.message : String(error) })
            };
        },
        async getById(
            req : FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ){
            try {                const { id } = req.params;
                const transactionData = await transaction.transactionService.getById(id);
                if (!transactionData) {
                    return reply.status(404).send({ error: "Transaction not found" });
                }
                return reply.status(200).send(transactionData);
            }
            catch (error) {
                return reply.status(400).send({ error: "Failed to get transaction", details: error instanceof Error ? error.message : String(error) })
            }

        },
        async update(
            req: FastifyRequest<{ Params: { id: string }, Body: TransactionBodyType }>,
            reply: FastifyReply
        ){
            try {
                const { id } = req.params;
                const transactionData = req.body;
                const updatedTransaction = await transaction.transactionService.update(id, transactionData);
                if (!updatedTransaction) {
                    return reply.status(404).send({ error: "Transaction not found" });
                }
                return reply.status(200).send(updatedTransaction);
            }
            catch (error) {
                return reply.status(400).send({ error: "Failed to update transaction", details: error instanceof Error ? error.message : String(error) })
            }

        },
        async delete(
            req: FastifyRequest<{ Params: { id: string } }>,
            reply: FastifyReply
        ){
            try {
                const { id } = req.params;
                await transaction.transactionService.delete(id);
                return reply.status(204).send();
            }
            catch (error) {
                return reply.status(400).send({ error: "Failed to delete transaction", details: error instanceof Error ? error.message : String(error) })
            } 
        }
    });