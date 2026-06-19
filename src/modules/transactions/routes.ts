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
                console.log("Created Transaction:", createdTransaction);
                return reply.status(201).send(createdTransaction);
            }
            catch (error) {
                console.error("Error registering transaction:", error);
                return reply.status(400).send({
                    error: "BAD_REQUEST",
                    message: error instanceof Error
                      ? error.message
                      : "Failed to register transaction"
                  });
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
                return reply.status(400).send({
                    error: "BAD_REQUEST",
                    message: error instanceof Error
                      ? error.message
                      : "Failed to register transaction"
                  });
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
                return reply.status(400).send({
                    error: "BAD_REQUEST",
                    message: error instanceof Error
                      ? error.message
                      : "Failed to register transaction"
                  });
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
                if (!updatedTransaction || updatedTransaction.length === 0) {
                    return reply.status(404).send({ error: "Transaction not found" });
                }
                return reply.status(200).send(updatedTransaction);
            }
            catch (error) {
                return reply.status(400).send({
                    error: "BAD_REQUEST",
                    message: error instanceof Error
                      ? error.message
                      : "Failed to register transaction"
                  });
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
                console.error("Error deleting transaction:", error);
                return reply.status(400).send({
                    error: "BAD_REQUEST",
                    message: error instanceof Error
                      ? error.message
                      : "Failed to register transaction"
                  });
                }
        }
    });