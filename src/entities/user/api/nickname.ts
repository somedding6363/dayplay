import "server-only";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/shared/api";
import { generateNickname } from "../model/nickname";
import { users } from "../model/schema";

const MAX_ATTEMPTS = 5;

// unique index 위반(Postgres 23505). Drizzle이 드라이버 오류를 cause로 감싼다.
function isUniqueViolation(error: unknown) {
  const cause = error instanceof Error ? error.cause : undefined;
  return typeof cause === "object" && cause !== null && "code" in cause && cause.code === "23505";
}

// 닉네임이 없으면 자동으로 만든다. 동시에 두 요청이 와도 nickname이 비어 있을 때만 쓰므로 하나만 남는다.
export async function ensureNickname(userId: string) {
  const [user] = await db
    .select({ nickname: users.nickname })
    .from(users)
    .where(eq(users.id, userId));
  if (!user) {
    return null;
  }
  if (user.nickname) {
    return user.nickname;
  }

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    try {
      const [updated] = await db
        .update(users)
        .set({ nickname: generateNickname() })
        .where(and(eq(users.id, userId), isNull(users.nickname)))
        .returning({ nickname: users.nickname });
      if (updated?.nickname) {
        return updated.nickname;
      }
      const [current] = await db
        .select({ nickname: users.nickname })
        .from(users)
        .where(eq(users.id, userId));
      return current?.nickname ?? null;
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
    }
  }
  throw new Error("닉네임을 만들지 못했어요.");
}
