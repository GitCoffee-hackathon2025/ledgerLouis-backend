import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { createProducerConnection } from "../../infrastructure/queue/connection.js";

export default fp(
  async function (app: FastifyInstance) {
    const { raw, connection } = await createProducerConnection();

    app.decorate("redis", connection);

    app.addHook("onClose", async () => {
      await raw.quit();
    });
  },
  {
    name: "redis",
    dependencies: ["env", "db", "auth"],
  },
);
