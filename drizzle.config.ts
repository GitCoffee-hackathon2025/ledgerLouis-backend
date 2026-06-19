import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schemas",
  out: "./drizzle",

  dbCredentials: {
    // host: process.env.DB_HOST!,
    // port: Number(process.env.DB_PORT),
    // user: process.env.DB_USER!,
    // password: process.env.DB_PASS!,
    // database: process.env.DATABASE!,
    url: process.env.DATABASE_URL!,
  },
});
