import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import "dotenv/config";
dotenv.config();

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schemas",
  out: "./drizzle",

  dbCredentials: { url: process.env.DATABASE_URL! },
});
