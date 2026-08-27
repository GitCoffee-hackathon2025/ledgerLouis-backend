import { type DB } from "../../../types/db.js";
import {
  and,
  count,
  desc,
  eq,
  isNull,
  type InferInsertModel,
} from "drizzle-orm";
import {
  companies,
  companyUsers,
  users,
} from "../../../database/schemas/index.js";

type CompanyUserInsert = InferInsertModel<typeof companyUsers>;

export const createMemberRepository = (db: DB) => ({
  async create(data: CompanyUserInsert) {
    return db.insert(companyUsers).values(data);
  },

  async findAllByUserId(
    userId: CompanyUserInsert["userId"],
    limit = 20,
    offset = 0,
  ) {
    return db
      .select({
        companyName: companies.name,
        companyId: companies.id,
        cnpj: companies.cnpj,
        email: companies.email,
        cep: companies.cep,
        phone: companies.phone,
        role: companyUsers.role,
        createdAt: companyUsers.createdAt,
      })
      .from(companyUsers)
      .innerJoin(companies, eq(companies.id, companyUsers.companyId))
      .where(
        and(eq(companyUsers.userId, userId), isNull(companyUsers.deletedAt)),
      )
      .orderBy(desc(companyUsers.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async findAllByCompanyId(
    companyId: CompanyUserInsert["companyId"],
    limit = 20,
    offset = 0,
  ) {
    return db
      .select({
        userId: users.id,
        name: users.name,
        email: users.email,
        role: companyUsers.role,
        createdAt: companyUsers.createdAt,
      })
      .from(companyUsers)
      .innerJoin(users, eq(users.id, companyUsers.userId))
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          isNull(companyUsers.deletedAt),
        ),
      )
      .orderBy(desc(companyUsers.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async findMembership(
    companyId: CompanyUserInsert["companyId"],
    userId: CompanyUserInsert["userId"],
  ) {
    return db.query.companyUsers.findFirst({
      where: (table, { eq, isNull, and }) =>
        and(
          eq(table.companyId, companyId),
          eq(table.userId, userId),
          isNull(table.deletedAt),
        ),
    });
  },

  async countByCompanyId(companyId: CompanyUserInsert["companyId"]) {
    const result = await db
      .select({ count: count() })
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          isNull(companyUsers.deletedAt),
        ),
      );

    return result[0]?.count ?? 0;
  },

  async countOwners(companyId: CompanyUserInsert["companyId"]) {
    const result = await db
      .select({ count: count() })
      .from(companyUsers)
      .where(
        and(
          eq(companyUsers.companyId, companyId),
          eq(companyUsers.role, "owner"),
          isNull(companyUsers.deletedAt),
        ),
      );

    return result[0]?.count ?? 0;
  },

  async changeRole(
    id: NonNullable<CompanyUserInsert["id"]>,
    role: CompanyUserInsert["role"],
  ) {
    return db
      .update(companyUsers)
      .set({ role, updatedAt: new Date() })
      .where(and(eq(companyUsers.id, id), isNull(companyUsers.deletedAt)));
  },

  async delete(id: NonNullable<CompanyUserInsert["id"]>) {
    return db
      .update(companyUsers)
      .set({ deletedAt: new Date() })
      .where(and(eq(companyUsers.id, id), isNull(companyUsers.deletedAt)));
  },
});
