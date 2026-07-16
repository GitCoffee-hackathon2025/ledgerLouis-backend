import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";

import { createProducerConnection } from "../../infrastructure/queue/connection.js";

export default fp(
  async function (app: FastifyInstance) {
    const { raw, adapter } = await createProducerConnection();

    app.decorate("redis", {raw, adapter});

    app.addHook("onClose", async () => {
      await raw.quit();
    });
  },
  {
    name: "redis",
    dependencies: ["env", "db"],
  },
);
