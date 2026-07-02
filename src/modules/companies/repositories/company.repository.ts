import { type DB } from "../../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { companies } from "../../../database/schemas/index.js";

type CompanyInsert = InferInsertModel<typeof companies>;

export const createCompanyRepository = (db: DB) => ({
  async create(data: CompanyInsert) {
    return db.insert(companies).values(data);
  },

  async updateName(
    id: NonNullable<CompanyInsert["id"]>,
    name: CompanyInsert["name"],
  ) {
    return db
      .update(companies)
      .set({ name, updatedAt: new Date() })
      .where(and(eq(companies.id, id), isNull(companies.deletedAt)));
  },

  async findById(id: NonNullable<CompanyInsert["id"]>) {
    return db.query.companies.findFirst({
      where: (table, { eq, isNull, and }) =>
        and(eq(table.id, id), isNull(table.deletedAt)),
    });
  },

  async findByCnpj(cnpj: NonNullable<CompanyInsert["cnpj"]>) {
    return db.query.companies.findFirst({
      where: (table, { eq, isNull, and }) =>
        and(eq(table.cnpj, cnpj), isNull(table.deletedAt)),
    });
  },

  async list() {
    return db.query.companies.findMany({
      where: (table, { isNull }) => isNull(table.deletedAt),
    });
  },

  async delete(id: NonNullable<CompanyInsert["id"]>) {
    return db
      .update(companies)
      .set({ deletedAt: new Date() })
      .where(and(eq(companies.id, id), isNull(companies.deletedAt)));
  },
});
