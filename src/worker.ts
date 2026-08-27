import dotenv from "dotenv";
dotenv.config();

import readline from "node:readline";

import { buildServiceWorker } from "./worker/app.js";
import { closeWorkers } from "./infrastructure/queue/worker.runtime.js";

async function bootstrap() {
  const { context, closeInfrastructure } = await buildServiceWorker();

  let shuttingDown = false;

  async function shutdown(reason: string) {
    if (shuttingDown) return;

    shuttingDown = true;

    console.log(`\nReceived ${reason}. Shutting down worker...`);

    try {
      if (process.stdin.isTTY) process.stdin.setRawMode(false);

      await closeWorkers(context);
      await closeInfrastructure();

      console.log("Worker shutdown complete.");
      process.exit(0);
    } catch (error) {
      console.error("Error during worker shutdown:", error);
      process.exit(1);
    }
  }

  readline.emitKeypressEvents(process.stdin);

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);

    process.stdin.on("keypress", (_, key) => {
      // if (key.name?.toLowerCase() === "q") void shutdown("Q");

      if (key.ctrl && key.name === "c") void shutdown("SIGINT");
    });
  }

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    void shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    void shutdown("unhandledRejection");
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start worker:", error);
  process.exit(1);
});
