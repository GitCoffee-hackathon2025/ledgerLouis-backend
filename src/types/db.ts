import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../database/schemas";

export type DB = MySql2Database<typeof schema>;
