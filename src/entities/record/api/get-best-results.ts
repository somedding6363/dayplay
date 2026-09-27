import "server-only";
import { eq, inArray, sql } from "drizzle-orm";
import type { Better } from "@/entities/game";
import { db } from "@/shared/api";
import { gameResults } from "../model/schema";

export interface BestResult {
  rawResult: unknown;
  value: number | null;
}

// 게임마다 모든 날짜를 통틀은 내 최고 기록. 순위와 같은 기준(게임 방향, 무효는 뒤, 먼저 세운 기록)이다.
// 방향은 게임 규칙에 있어서 호출하는 쪽이 게임별로 넘긴다.
export async function getBestResults(
  userId: string,
  directions: Record<string, Better>,
): Promise<Record<string, BestResult>> {
  const lowerIds = Object.keys(directions).filter((gameId) => directions[gameId] === "lower");
  // 작을수록 좋은 게임은 부호를 뒤집어 모든 게임을 한 방향(desc)으로 정렬한다.
  const rank =
    lowerIds.length > 0
      ? sql`case when ${inArray(gameResults.gameId, lowerIds)} then -${gameResults.value} else ${gameResults.value} end`
      : sql`${gameResults.value}`;
  const rows = await db
    .selectDistinctOn([gameResults.gameId], {
      gameId: gameResults.gameId,
      rawResult: gameResults.rawResult,
      value: gameResults.value,
    })
    .from(gameResults)
    .where(eq(gameResults.userId, userId))
    .orderBy(gameResults.gameId, sql`${rank} desc nulls last`, gameResults.achievedAt);
  return Object.fromEntries(
    rows.map(({ gameId, rawResult, value }) => [gameId, { rawResult, value }]),
  );
}
