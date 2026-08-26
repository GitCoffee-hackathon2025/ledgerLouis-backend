import { generateId, toId, type ULID } from "../../../domain/shared/id.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
import type { TransactionLedgerBodyType } from "../schemas/transaction.schema.js";
import type { createTransactionRepository } from "../repositories/transaction.repository.js";
import type { createLedgerService } from "./ledger.service.js";
import type { createAccountService } from "./account.service.js";
import type { createMemberService } from "../../companies/services/member.service.js"; // Importado!

export const createTransactionService = (
  repo: ReturnType<typeof createTransactionRepository>,
  ledgerService: ReturnType<typeof createLedgerService>,
  accountService: ReturnType<typeof createAccountService>,
  memberService: ReturnType<typeof createMemberService>, // Injetado como dependência
) => ({
  
  async find(id: ULID, companyId: ULID, userId: ULID) {
    // 1. Valida se o usuário pelo menos pertence à empresa
    await memberService.assertRole(companyId, userId);

    const tx = await repo.findById(id);

    if (!tx || tx.companyId !== companyId) {
      throw new AppError("TRANSACTION_NOT_FOUND");
    }

    const ledgers = await ledgerService.listByTransaction(id);

    return {
      ...tx,
      ledgers,
    };
  },

  async list(userId: ULID, opts?: { companyId?: ULID; projectId?: ULID }) {
    // 1. Se tentou listar transações de uma empresa, valida o acesso dele nela
    if (opts?.companyId) {
      await memberService.assertRole(opts.companyId, userId);
    }

    const all = await repo.list();
    
    let filtered = all;
    if (opts?.companyId) {
      filtered = filtered.filter((t: any) => t.companyId === opts.companyId);
    }
    if (opts?.projectId) {
      filtered = filtered.filter((t: any) => t.projectId === opts.projectId);
    }

    return filtered;
  },

 async create(userId: ULID, payload: TransactionLedgerBodyType) {
  const companyId = toId(payload.companyId);

  // 1. Valida se o usuário tem permissão na empresa.
  await memberService.assertRole(companyId, userId);

  return this.createInternal(payload, userId);
 },

 // Materializa uma transação sem checar permissão do usuário — usado pelo worker
 // de recorrências, que não tem um usuário autenticado na requisição (D3 do plano).
 // Reaproveita exatamente a mesma lógica de saldo/ledger do create() público.
 async createInternal(
   payload: TransactionLedgerBodyType & { recurringTransactionId?: ULID },
   userId?: ULID,
 ) {
  const companyId = toId(payload.companyId);

  // 1. Busca as contas para achar a conta da empresa
  const accounts = await accountService.list(companyId);
  const targetAccount = accounts.find((acc: any) => acc.companyId === companyId);

  if (!targetAccount) {
    throw new AppError("ACCOUNT_NOT_FOUND");
  }

  // Pegamos o valor puro vindo do payload (garantindo que seja tratado como número para a matemática)
  const numericAmount = Number(payload.amount || 0);

  // 2. Criação do objeto para o banco de dados (Drizzle)
  const row = {
    ...payload,
    id: generateId(),
    companyId,
    projectId: payload.projectId ? toId(payload.projectId) : undefined,

    //  AQUI ESTÁ A CHAVE: Passa como String para o repositório/Drizzle aceitar o numeric(15,2)
    amount: numericAmount.toString(),

    createdBy: userId,
    updatedBy: userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Agora o TypeScript e o Drizzle vão aceitar perfeitamente sem erro!
  await repo.create(row);

  // 3. Atualização do saldo da conta (Matemática com números)
  const currentBalance = Number(targetAccount.value || 0);

  // Se for débito, o valor fica negativo para subtrair no balanço
  const transactionValue = payload.entryType === "debit" ? -numericAmount : numericAmount;
  const newBalance = currentBalance + transactionValue;

  // Atualiza o saldo salvando de volta como string no banco de contas
  await accountService.updateValue(toId(targetAccount.id), toId(userId ?? targetAccount.id), newBalance.toString());

  // Retorna o objeto criado
  return {
    ...row,
  };
 },

  async delete(id: ULID, companyId: ULID, userId: ULID) {
    // 1. Segurança Crítica: Excluir registro financeiro é perigoso.
    // Aqui nós dizemos que APENAS quem for "owner" da empresa pode deletar uma transação!
    await memberService.assertRole(companyId, userId, ["owner"]);

    const existing = await repo.findById(id);

    if (!existing || existing.companyId !== companyId) {
      throw new AppError("TRANSACTION_NOT_FOUND");
    }



    // Estorna o valor da conta ao deletar a transação
    const accounts = await accountService.list(userId);
    const targetAccount = accounts.find((acc: any) => acc.companyId === companyId);
    
    if (targetAccount) {
      const currentBalance = Number(targetAccount.value);
      const transactionValue = Number((existing as any).value || 0);
      const revertedBalance = currentBalance - transactionValue;
      await accountService.updateValue(toId(targetAccount.id), toId(userId), revertedBalance.toString());
    }

    await repo.delete(id);
  },

  async getAccountValue(companyId: ULID, userId: ULID) {
    // console.log("Obtendo valor da conta para a empresa:", companyId, "e usuário:", userId);
      await memberService.assertRole(companyId, userId);
      const value = await accountService.getValue(companyId);
      return value;
  },
});