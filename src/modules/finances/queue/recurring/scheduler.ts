import type { Queue } from "bullmq";

export async function registerRecurringScheduler(
  { idName, jobName }: { idName: string; jobName: string },
  queue: Queue,
) {
  // Agenda a execução diária. Idempotente por id do scheduler — chamar de
  // novo (ex: toda vez que o worker sobe) nunca acumula agendamentos duplicados.
  await queue.upsertJobScheduler(
    idName,
    { pattern: "5 3 * * *", tz: "America/Sao_Paulo" },
    { name: jobName },
  );
}
