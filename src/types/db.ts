import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../database/schemas/index.js";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
export type DB = NodePgDatabase<typeof schema>;
