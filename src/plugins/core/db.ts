import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { createDatabase } from "../../database";

export default fp(
  async function (app: FastifyInstance) {
    const { db, pool } = await createDatabase(
      app.config.DB_HOST,
      app.config.DB_PORT,
      app.config.DB_USER,
      app.config.DB_PASS,
      app.config.DATABASE,
    );

    app.decorate("db", db);

    app.addHook("onClose", async () => {
      await pool.promise().end();
    });
  },
  {
    name: "db",
    dependencies: ["env"],
  },
);
