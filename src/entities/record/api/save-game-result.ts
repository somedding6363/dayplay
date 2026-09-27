import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import type { GameRules } from "@/entities/game";
import { db } from "@/shared/api";
import { readPlayToken } from "../model/play-token";
import { gameResults, resultRequests } from "../model/schema";
import { playTokenSecret } from "./play-token-secret";

export type SaveRejectReason = "invalid-token" | "game-mismatch" | "invalid-result" | "play-used";

export type SaveGameResult<TResult> =
  | {
      status: "saved";
      score: number;
      // 예전 규칙 버전으로 저장된 기록을 지금 규칙으로 읽지 못하면 rawResult는 null이다.
      best: { rawResult: TResult | null; score: number };
      // 이번 판이 내 기록이 되었는지. 같은 판을 다시 보내도 같은 값이 나온다.
      improved: boolean;
    }
  | { status: "rejected"; reason: SaveRejectReason };

interface SaveInput {
  userId: string;
  playToken: string;
  result: unknown;
}

// 모든 게임이 같이 쓰는 저장 흐름. 게임마다 다른 검증과 점수 변환만 rules가 맡는다.
// neon-http는 대화형 트랜잭션이 없어서 각 단계를 한 문장으로 원자적으로 처리한다.
export async function saveGameResult<TResult>(
  { userId, playToken, result }: SaveInput,
  rules: Pick<GameRules<TResult>, "id" | "version" | "parseResult" | "toScore">,
  now = new Date(),
): Promise<SaveGameResult<TResult>> {
  const play = await readPlayToken(playToken, playTokenSecret(), now.getTime());
  if (!play) {
    return { status: "rejected", reason: "invalid-token" };
  }
  if (play.gameId !== rules.id) {
    return { status: "rejected", reason: "game-mismatch" };
  }

  const parsed = rules.parseResult(result);
  if (parsed === null) {
    return { status: "rejected", reason: "invalid-result" };
  }
  const score = rules.toScore(parsed);
  if (!Number.isSafeInteger(score)) {
    return { status: "rejected", reason: "invalid-result" };
  }

  // 판을 먼저 차지한다. 이미 저장된 판이면 같은 사용자의 같은 결과(재전송)만 이어서 처리한다.
  const [claimed] = await db
    .insert(resultRequests)
    .values({ playId: play.playId, userId, score })
    .onConflictDoNothing()
    .returning({ playId: resultRequests.playId });
  if (!claimed) {
    const [existing] = await db
      .select()
      .from(resultRequests)
      .where(eq(resultRequests.playId, play.playId));
    if (!existing || existing.userId !== userId || existing.score !== score) {
      return { status: "rejected", reason: "play-used" };
    }
  }

  // 더 높은 점수일 때만 덮어쓴다. 여러 탭이 동시에 저장해도 한 문장이라 높은 쪽이 남는다.
  await db
    .insert(gameResults)
    .values({
      userId,
      date: play.date,
      gameId: play.gameId,
      gameVersion: rules.version,
      rawResult: parsed,
      score,
      playId: play.playId,
      achievedAt: now,
    })
    .onConflictDoUpdate({
      target: [gameResults.userId, gameResults.date, gameResults.gameId],
      set: {
        gameVersion: sql`excluded.game_version`,
        rawResult: sql`excluded.raw_result`,
        score: sql`excluded.score`,
        playId: sql`excluded.play_id`,
        achievedAt: sql`excluded.achieved_at`,
      },
      setWhere: gt(sql`excluded.score`, gameResults.score),
    });

  const [best] = await db
    .select({
      rawResult: gameResults.rawResult,
      score: gameResults.score,
      playId: gameResults.playId,
    })
    .from(gameResults)
    .where(
      and(
        eq(gameResults.userId, userId),
        eq(gameResults.date, play.date),
        eq(gameResults.gameId, play.gameId),
      ),
    );
  if (!best) {
    throw new Error("저장한 내 기록을 읽지 못했어요.");
  }
  const improved = best.playId === play.playId;

  return {
    status: "saved",
    score,
    best: { rawResult: improved ? parsed : rules.parseResult(best.rawResult), score: best.score },
    improved,
  };
}
