import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL 환경 변수가 없어요.");
}

// HTTP 드라이버는 연결을 유지하지 않아 Vercel 서버리스 함수에서 연결 수가 쌓이지 않는다.
export const db = drizzle(neon(databaseUrl));
