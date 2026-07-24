import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { createDatabaseService } from "../../../infrastructure/database/index.js";

export default fp(
  async function (app: FastifyInstance) {
    const { db, close } = await createDatabaseService(app.config.DATABASE_URL);

    app.decorate("db", db);

    app.addHook("onClose", async () => {
      await close();
    });
  },
  {
    name: "db",
    dependencies: ["env"],
  },
);
