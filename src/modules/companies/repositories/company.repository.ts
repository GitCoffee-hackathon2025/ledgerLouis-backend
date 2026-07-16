import { type DB } from "../../../types/db.js";
import { and, eq, isNull, type InferInsertModel } from "drizzle-orm";
import { companies } from "../../../database/schemas/index.js";

type CompanyInsert = InferInsertModel<typeof companies>;

export const createCompanyRepository = (db: DB) => ({
  async create(data: CompanyInsert) {
    return db.insert(companies).values(data);
  },

  async update(
    id: NonNullable<CompanyInsert["id"]>,
    data: Partial<Pick<CompanyInsert, "name" | "email" | "cep" | "phone">>,
  ) {
    return db
      .update(companies)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(companies.id, id), isNull(companies.deletedAt)))
      .returning({
        id: companies.id,
        name: companies.name,
        email: companies.email,
        cep: companies.cep,
        phone: companies.phone,
        createAt: companies.createdAt,
        updatedAt: companies.updatedAt,
      })
      .then(([row]) => row);
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
