import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { createDatabase } from "../../../database/index.js";

export default fp(
  async function (app: FastifyInstance) {
    const { db, pool } = await createDatabase(app.config.DATABASE_URL);

    app.decorate("db", db);

    app.addHook("onClose", async () => {
      await pool.end();
    });
  },
  {
    name: "db",
    dependencies: ["env"],
  },
);
