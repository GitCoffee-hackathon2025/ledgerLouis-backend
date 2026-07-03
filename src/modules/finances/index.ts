import type { FastifyInstance } from "fastify";

import { buildTransactionModule } from "./module.js";

import { transactionRoutes } from "./routes/transaction.router.js";

export default async function (app: FastifyInstance) {
  const transactionModule = buildTransactionModule(app);

  await app.register(transactionRoutes(transactionModule.transactionService), {
    prefix: "/finances",
  });
}


