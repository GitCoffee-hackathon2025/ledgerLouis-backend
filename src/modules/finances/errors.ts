export const transactionErrors = {
  TRANSACTION_NOT_FOUND: [404, "Transaction not found"],
} as const;

export const ledgerErrors = {
  LEDGER_NOT_FOUND: [404, "Ledger entry not found"],
} as const;

export const accountErrors = {
  ACCOUNT_NOT_FOUND: [404, "Account not found"],
} as const;

export const recurringTransactionErrors = {
  RECURRING_TRANSACTION_NOT_FOUND: [404, "Recurring transaction not found"],
  RECURRING_TRANSACTION_INVALID_PERIOD: [
    400,
    "End date must be after start date",
  ],
  RECURRING_TRANSACTION_INACTIVE: [409, "Recurring transaction is not active"],
} as const;
