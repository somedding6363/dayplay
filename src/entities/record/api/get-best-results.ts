import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/shared/api";
import { gameResults } from "../model/schema";

export interface BestResult {
  rawResult: unknown;
  score: number | null;
}

// 게임마다 모든 날짜를 통틀은 내 최고 기록. 순위와 같은 기준(score desc nulls last, 먼저 세운 기록)이다.
export async function getBestResults(userId: string): Promise<Record<string, BestResult>> {
  const rows = await db
    .selectDistinctOn([gameResults.gameId], {
      gameId: gameResults.gameId,
      rawResult: gameResults.rawResult,
      score: gameResults.score,
    })
    .from(gameResults)
    .where(eq(gameResults.userId, userId))
    .orderBy(gameResults.gameId, sql`${gameResults.score} desc nulls last`, gameResults.achievedAt);
  return Object.fromEntries(
    rows.map(({ gameId, rawResult, score }) => [gameId, { rawResult, score }]),
  );
}
