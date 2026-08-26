import type { DB } from "../../types/db.js";

import { createTransactionRepository } from "./repositories/transaction.repository.js";
import { createLedgerRepository } from "./repositories/ledger.repository.js";
import { createRecurringTransactionRepository } from "./repositories/recurringTransaction.repository.js";
import { createTransactionService } from "./services/transaction.service.js";
import { createLedgerService } from "./services/ledger.service.js";
import { createAccountService } from "./services/account.service.js";
import { createRecurringTransactionService } from "./services/recurringTransaction.service.js";
import { createMemberService } from "../companies/services/member.service.js";
import { createMemberRepository } from "../companies/repositories/member.repository.js";
import { createUserRepository } from "../users/repositories/user.repository.js";
import { createAccountRepository } from "./repositories/account.repository.js";

export function buildTransactionModule(db: DB) {
  const transactionRepo = createTransactionRepository(db);
  const ledgerRepo = createLedgerRepository(db);
  const recurringTransactionRepo = createRecurringTransactionRepository(db);
  const memberRepo = createMemberRepository(db);
  const accountRepo = createAccountRepository(db);
  const userRepo = createUserRepository(db);
  const memberService = createMemberService(memberRepo, userRepo);
  const accountService = createAccountService(accountRepo);
  const ledgerService = createLedgerService(ledgerRepo);
  const transactionService = createTransactionService(
    transactionRepo,
    ledgerService,
    accountService,
    memberService,
  );
  const recurringTransactionService = createRecurringTransactionService(
    recurringTransactionRepo,
    transactionService,
    accountService,
    memberService,
  );

  return {
    transactionService,
    ledgerService,
    memberService,
    accountService,
    recurringTransactionService,
  };
}
