import type { Queue } from "bullmq";

export async function registerFileCleanupScheduler(
  { idName, jobName }: { idName: string; jobName: string },
  queue: Queue,
) {
  await queue.upsertJobScheduler(
    idName,
    { every: 60 * 60 * 1000 /* 1 Hora */ },
    { name: jobName },
  );
}
