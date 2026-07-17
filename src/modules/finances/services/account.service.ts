
import type { createAccountRepository } from "../repositories/account.repository.js";
import { generateId, toId, type ULID } from "../../../domain/shared/id.js";
import type { accountCreate, accountUpdate } from "../schemas/account.schema.js";
import { AppError } from "../../../shared/errors/domain/errors.js";
export const createAccountService = (
  repo: ReturnType<typeof createAccountRepository>,
) => ({
  async find(id: ULID, userId: ULID) {
    const account = await repo.findById(id);

    if (!account) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    return account;
  },

  async list(companyId: ULID) {
    // console.log("Listando contas para a empresa:", companyId);
    return repo.list(companyId);
  },
  async createDefault(companyId: ULID) {
    const row = {
      id: generateId(),
      companyId,
      name: "Main Account",
      value: "0",
      type: "asset" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.create(row);

    return row;
    },
  async create(userId: ULID, payload: accountCreate) {
    const row = {
      ...payload,
      id: generateId(),
      companyId: toId(payload.companyId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await repo.create(row);
    return {
      ...row,
    };
  },
  async getValue(id: ULID) {
    const value = await repo.getValue(id);

    if (value === undefined) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    return value;
  },
  async update(id: ULID, userId: ULID, payload: accountUpdate) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const updated = {
      ...existing,
      ...payload,
      updatedAt: new Date(),
    };

    await repo.update(id, updated);
    return {
      ...updated,
    };
  },
  async updateValue(id: ULID, userId: ULID, value: string) {
    const existing = await repo.findById(id);

    if (!existing) {
      throw new Error("ACCOUNT_NOT_FOUND");
    }

    const updated = {
      ...existing,
      value,
      updatedAt: new Date(),
    };

    await repo.updateValue(id, value);
    return {
      ...updated,
    };
  }
});