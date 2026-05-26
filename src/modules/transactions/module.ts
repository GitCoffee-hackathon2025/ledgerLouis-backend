
import type { FastifyInstance } from "fastify";

import { createTransactionRepository } from "./repository.js";
import { createTransactionService} from "./service.js";
export function buildTransactionModule(app: FastifyInstance) {
    const repo = createTransactionRepository(app.db);
    const transactionService = createTransactionService(repo);
  return {
    transactionService,
  };
}