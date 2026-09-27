import type { AdapterAccountType } from "next-auth/adapters";
import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { users } from "@/entities/user";

// Auth.js Drizzle adapter가 요구하는 모양. 세션은 JWT라 sessions, verification_tokens 테이블은 두지 않는다.
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [primaryKey({ columns: [account.provider, account.providerAccountId] })],
);
