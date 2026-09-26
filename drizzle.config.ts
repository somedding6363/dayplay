import { defineConfig } from "drizzle-kit";

// drizzle-kit은 Next.js처럼 .env.local을 읽지 않아서 직접 불러온다.
process.loadEnvFile(".env.local");

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/**/model/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
