import type { FastifyInstance } from "fastify";

import { buildTransactionModule } from "./module.js";

import { transactionRoutes } from "./routes/transaction.router.js";

export default async function (app: FastifyInstance) {
  const module = buildTransactionModule(app.db);

  await app.register(transactionRoutes(module.transactionService), {
    prefix: "/companies",
  });
}
