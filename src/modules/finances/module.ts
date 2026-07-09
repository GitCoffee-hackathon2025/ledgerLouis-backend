import type { FastifyInstance } from "fastify";

import { createTransactionRepository } from "./repositories/transaction.repository.js";
import { createLedgerRepository } from "./repositories/ledger.repository.js";
import { createTransactionService } from "./services/transaction.service.js";
import { createLedgerService } from "./services/ledger.service.js";

export function buildTransactionModule(app: FastifyInstance) {
  const transactionRepo = createTransactionRepository(app.db);
  const ledgerRepo = createLedgerRepository(app.db);

  const ledgerService = createLedgerService(ledgerRepo);
  const transactionService = createTransactionService(
    transactionRepo,
    ledgerService,
  );

  return { transactionService, ledgerService };
}

