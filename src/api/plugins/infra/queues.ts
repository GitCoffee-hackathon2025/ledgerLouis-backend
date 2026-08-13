import fp from "fastify-plugin";
import type { FastifyInstance } from "fastify";
import { FastifyAdapter } from "@bull-board/fastify";
import { createBullBoard } from "@bull-board/api";

export default fp(
  async function (app: FastifyInstance) {
    const url: `/${string}` = "/queues";

    const serverAdapter = new FastifyAdapter();

    createBullBoard({
      queues: [],
      serverAdapter,
    });

    serverAdapter.setBasePath(url);
    await app.register(serverAdapter.registerPlugin(), { prefix: url });
  },
  {
    name: "queues",
    dependencies: ["env", "db", "redis"],
  },
);

