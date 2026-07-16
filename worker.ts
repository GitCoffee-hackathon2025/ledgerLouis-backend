import dotenv from "dotenv";
dotenv.config();

import {
  registerWorkers,
  closeWorkers,
} from "./src/infrastructure/queue/runtime.js";

async function bootstrap() {
  const context = await registerWorkers();

  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;

    try {
      await closeWorkers(context);
    } catch (err) {
      console.error(err);
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("uncaughtException", (err) => {
    console.error(err);
    void shutdown("uncaughtException");
  });
  process.on("unhandledRejection", (err) => {
    console.error(err);
    void shutdown("unhandledRejection");
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
