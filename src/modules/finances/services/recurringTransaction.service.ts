import { AppError } from "../../../shared/errors/domain/errors.js";
import { generateId, toId, type ULID } from "../../../domain/shared/id.js";
import { getUniqueConstraint } from "../../../infrastructure/database/errors/getUniqueConstraint.js";
import {
  todayISO,
  firstOccurrenceOnOrAfter,
  nextOccurrenceAfter,
  type Frequency,
} from "../../../shared/date/recurrence.js";
import type { createRecurringTransactionRepository } from "../repositories/recurringTransaction.repository.js";
import type { createTransactionService } from "./transaction.service.js";
import type { createAccountService } from "./account.service.js";
import type { createMemberService } from "../../companies/services/member.service.js";
import type {
  CreateRecurringBodyType,
  UpdateRecurringBodyType,
} from "../schemas/recurringTransaction.schema.js";

// Limite de ocorrências recuperadas numa única execução, caso o worker fique
// muito tempo parado — evita um backlog gigante gerar centenas de transações
// de uma vez (ver decisão D5 do plano).
const MAX_CATCHUP = 24;

type RecurringRow = Awaited<
  ReturnType<ReturnType<typeof createRecurringTransactionRepository>["findById"]>
>;

export const createRecurringTransactionService = (
  repo: ReturnType<typeof createRecurringTransactionRepository>,
  transactionService: ReturnType<typeof createTransactionService>,
  accountService: ReturnType<typeof createAccountService>,
  memberService: ReturnType<typeof createMemberService>,
) => {
  // Materializa as ocorrências vencidas de UMA regra, reaproveitando a mesma
  // lógica de saldo/ledger do transactionService (sem checar permissão —
  // usada tanto pelo endpoint "/run" quanto pelo worker agendado).
  const materializeOne = async (rule: NonNullable<RecurringRow>) => {
    let nextRunDate = rule.nextRunDate;
    let lastRunDate = rule.lastRunDate;
    let status = rule.status;
    let created = 0;
    const today = todayISO();

    for (let guard = 0; guard < MAX_CATCHUP && status === "active" && nextRunDate <= today; guard++) {
      if (rule.endDate && nextRunDate > rule.endDate) {
        status = "finished";
        break;
      }

      try {
        await transactionService.createInternal(
          {
            companyId: rule.companyId,
            amount: Number(rule.amount),
            description: rule.description ?? "Lançamento recorrente",
            entryType: rule.entryType,
            date: nextRunDate,
            recurringTransactionId: rule.id,
          },
          rule.createdBy ?? undefined,
        );
        created += 1;
      } catch (error) {
        // Já materializado por uma execução concorrente (índice único
        // regra+data) — não é erro, só avança para a próxima ocorrência.
        if (!getUniqueConstraint(error, ["uq_transactions_recurring_date"])) throw error;
      }

      lastRunDate = nextRunDate;
      nextRunDate = nextOccurrenceAfter(
        rule.startDate,
        rule.frequency as Frequency,
        rule.intervalValue ?? 1,
        nextRunDate,
      );

      if (rule.endDate && nextRunDate > rule.endDate) {
        status = "finished";
      }
    }

    await repo.update(rule.id, { nextRunDate, lastRunDate, status });

    return { id: rule.id, created, status, nextRunDate };
  };

  return {
    async find(companyId: ULID, userId: ULID, id: ULID) {
      await memberService.assertRole(companyId, userId);

      const rule = await repo.findById(id);
      if (!rule || rule.companyId !== companyId)
        throw new AppError("RECURRING_TRANSACTION_NOT_FOUND");

      return rule;
    },

    async list(companyId: ULID, userId: ULID) {
      await memberService.assertRole(companyId, userId);
      return repo.listByCompany(companyId);
    },

    async create(companyId: ULID, userId: ULID, body: CreateRecurringBodyType) {
      await memberService.assertRole(companyId, userId);

      if (body.endDate && body.endDate < body.startDate)
        throw new AppError("RECURRING_TRANSACTION_INVALID_PERIOD");

      // Melhor esforço: associa a conta principal da empresa, só para
      // rastreabilidade — o materializeOne busca a conta de novo na hora de
      // aplicar o lançamento, então isso nunca bloqueia a criação da regra.
      const accounts = await accountService.list(companyId);
      const mainAccount = accounts.find((acc: any) => acc.companyId === companyId);

      const id = generateId();
      const nextRunDate = firstOccurrenceOnOrAfter(
        body.startDate,
        body.frequency,
        body.intervalValue ?? 1,
        todayISO(),
      );

      await repo.create({
        id,
        companyId,
        description: body.description,
        amount: body.amount.toString(),
        entryType: body.entryType,
        frequency: body.frequency,
        intervalValue: body.intervalValue ?? 1,
        startDate: body.startDate,
        endDate: body.endDate,
        nextRunDate,
        sourceAccountId: mainAccount ? toId(mainAccount.id) : undefined,
        categoryAccountId: mainAccount ? toId(mainAccount.id) : undefined,
        createdBy: userId,
      });

      return repo.findById(id);
    },

    async update(companyId: ULID, userId: ULID, id: ULID, body: UpdateRecurringBodyType) {
      await memberService.assertRole(companyId, userId, ["owner", "admin"]);

      const existing = await repo.findById(id);
      if (!existing || existing.companyId !== companyId)
        throw new AppError("RECURRING_TRANSACTION_NOT_FOUND");

      if (body.endDate && body.endDate < existing.startDate)
        throw new AppError("RECURRING_TRANSACTION_INVALID_PERIOD");

      await repo.update(id, {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount !== undefined && { amount: body.amount.toString() }),
        ...(body.entryType !== undefined && { entryType: body.entryType }),
        ...(body.frequency !== undefined && { frequency: body.frequency }),
        ...(body.intervalValue !== undefined && { intervalValue: body.intervalValue }),
        ...(body.endDate !== undefined && { endDate: body.endDate }),
        ...(body.status !== undefined && { status: body.status }),
      });

      return repo.findById(id);
    },

    async delete(companyId: ULID, userId: ULID, id: ULID) {
      await memberService.assertRole(companyId, userId, ["owner", "admin"]);

      const existing = await repo.findById(id);
      if (!existing || existing.companyId !== companyId)
        throw new AppError("RECURRING_TRANSACTION_NOT_FOUND");

      await repo.delete(id);
    },

    // Disparo manual ("Lançar agora") — só o owner pode forçar, e só processa
    // o que já está de fato vencido (não antecipa cobranças fora do calendário).
    async run(companyId: ULID, userId: ULID, id: ULID) {
      await memberService.assertRole(companyId, userId, ["owner"]);

      const rule = await repo.findById(id);
      if (!rule || rule.companyId !== companyId)
        throw new AppError("RECURRING_TRANSACTION_NOT_FOUND");

      if (rule.status !== "active") throw new AppError("RECURRING_TRANSACTION_INACTIVE");

      return materializeOne(rule);
    },

    // Ponto de entrada do worker agendado — sem checagem de permissão (D3):
    // roda fora do contexto de uma requisição, sem usuário autenticado.
    async materializeDue(today = todayISO()) {
      const due = await repo.listDue(today);
      const results = [];

      for (const rule of due) {
        try {
          results.push(await materializeOne(rule));
        } catch (error) {
          console.error(`[recurring] falha ao processar a regra ${rule.id}:`, error);
          results.push({ id: rule.id, created: 0, status: rule.status, error: true });
        }
      }

      return results;
    },
  };
};
