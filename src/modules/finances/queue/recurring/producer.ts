import type { Queue } from "bullmq";

const SCHEDULER_ID = "recurring-daily";
const JOB_NAME = "materialize-due";

export function createRecurringProducer(queue: Queue) {
  return {
    // Agenda a execução diária. Idempotente por id do scheduler — chamar de
    // novo (ex: toda vez que o worker sobe) nunca acumula agendamentos duplicados.
    scheduleDaily() {
      return queue.upsertJobScheduler(
        SCHEDULER_ID,
        { pattern: "5 3 * * *", tz: "America/Sao_Paulo" },
        { name: JOB_NAME },
      );
    },

    // Dispara uma execução avulsa (fora do agendamento) — não usado pela API
    // hoje (o endpoint POST /:id/run materializa direto via service), mas
    // fica disponível para acionar o processamento em lote sob demanda.
    runNow() {
      return queue.add(JOB_NAME, {});
    },
  };
}
