import "server-only";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { db } from "@/shared/api";
import { users } from "@/entities/user";
import { accounts } from "../model/schema";

// 세션을 JWT로 두어 요청마다 DB를 읽지 않는다. 사용자와 계정 연결만 DB에 저장한다.
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts }),
  session: { strategy: "jwt" },
  providers: [Google],
  callbacks: {
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
