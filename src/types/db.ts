import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../database/schemas/index.js";

export type DB = NodePgDatabase<typeof schema>;
