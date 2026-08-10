import dotenv from "dotenv";
dotenv.config();

import { execFileSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL não definida");
}

const sql = `
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    )
    LOOP
        EXECUTE format(
            'TRUNCATE TABLE %I RESTART IDENTITY CASCADE',
            r.tablename
        );
    END LOOP;
END $$;
`;

execFileSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-c", sql], {
  stdio: "inherit",
});
