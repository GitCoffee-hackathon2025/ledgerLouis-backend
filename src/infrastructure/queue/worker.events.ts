import type { Worker } from "bullmq";

function timestamp() {
  const now = new Date();

  return (
    now.toLocaleTimeString("pt-BR", {
      hour12: false,
    }) +
    "." +
    now.getMilliseconds().toString().padStart(3, "0")
  );
}

function log(name: string, message: string) {
  console.log(`[${timestamp()}] (Worker:${name}) ${message}`);
}

function error(name: string, message: string, err: unknown) {
  console.error(`[${timestamp()}] (Worker:${name}) ${message}`, err);
}

export function attachWorkerEvents(name: string, worker: Worker) {
  log(name, "Registered");

  worker.on("ready", () => {
    log(name, "Ready");
  });

  worker.on("active", (job) => {
    log(name, `Job ${job.id} started`);
  });

  worker.on("completed", (job) => {
    log(name, `Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    error(name, `Job ${job?.id} failed`, err);
  });

  worker.on("error", (err) => {
    error(name, "Error", err);
  });

  worker.on("paused", () => {
    log(name, "Paused");
  });

  worker.on("resumed", () => {
    log(name, "Resumed");
  });

  worker.on("closing", () => {
    log(name, "Closing");
  });

  worker.on("closed", () => {
    log(name, "Closed");
  });
}
