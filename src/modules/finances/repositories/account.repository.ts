import { eq, and, type InferInsertModel } from "drizzle-orm";
import type { DB } from "../../../types/db.js";
import type {accountCreate, account, accountUpdate} from "../schemas/account.schema.js";
import { accounts } from "../../../database/schemas/index.js";
import type { ULID } from "../../../domain/shared/id.js";

type AccountInsert = InferInsertModel<typeof accounts>;

export const createAccountRepository = (db: DB) => ({
  async create(data: AccountInsert) {
    const [inserted] = await db
      .insert(accounts)
      .values(data)
      .returning();
    return inserted as account;
    },
  async findById(id: ULID) {
    const [row] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id))
      .limit(1);
    return row as account | undefined;
  },
  async list(companyId: ULID) {
    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.companyId, companyId))
      .orderBy(accounts.createdAt);
    return rows as account[];
  },
  async update(id: ULID, data: accountUpdate) {
    const [updated] = await db
      .update(accounts)
      .set(data)
      .where(eq(accounts.id, id))
      .returning();
    return updated as account;
  },
  async updateValue(id: ULID, value: string) {
    const [updated] = await db
      .update(accounts)
      .set({ value })
      .where(eq(accounts.id, id))
      .returning();
    return updated as account;
  }
})