import "server-only";
import { sql, type AnyColumn } from "drizzle-orm";
import type { GameRules } from "@/entities/game";
import { db } from "@/shared/api";
import { fitsElapsed, readPlayToken } from "../model/play-token";
import { gameResults } from "../model/schema";
import { playTokenSecret } from "./play-token-secret";

export type SaveRejectReason =
  "invalid-token" | "game-mismatch" | "invalid-result" | "invalid-duration";

export type SaveGameResult<TResult> =
  | {
      status: "saved";
      // 무효 결과는 null이다.
      value: number | null;
      // 예전 규칙 버전으로 저장된 기록을 지금 규칙으로 읽지 못하면 rawResult는 null이다.
      best: { rawResult: TResult | null; value: number | null };
      // 이번 play가 내 기록이 되었는지.
      improved: boolean;
      // 그날 이 게임을 끝낸 play 수.
      attempts: number;
    }
  | { status: "rejected"; reason: SaveRejectReason };

interface SaveInput {
  userId: string;
  playToken: string;
  result: unknown;
}

interface SaveOptions {
  now?: Date;
  // 기본값은 PLAY_TOKEN_MAX_AGE_MS. 로그인 직후 임시 기록 병합에서만 늘린다.
  maxTokenAgeMs?: number;
  // 더할 시도 횟수. 로그인 직후 병합은 브라우저에서 센 횟수를 한 번에 더한다.
  attempts?: number;
}

// 모든 게임이 같이 쓰는 저장 흐름. 게임마다 다른 검증과 점수 변환만 rules가 맡는다.
// 무효도 점수가 null인 하나의 결과라 같은 흐름으로 저장한다.
// neon-http는 대화형 트랜잭션이 없어서 내 기록 갱신과 시도 횟수를 한 문장으로 처리한다.
export async function saveGameResult<TResult>(
  { userId, playToken, result }: SaveInput,
  rules: Pick<
    GameRules<TResult>,
    "id" | "version" | "parseResult" | "toValue" | "better" | "durationMs"
  >,
  { now = new Date(), maxTokenAgeMs, attempts = 1 }: SaveOptions = {},
): Promise<SaveGameResult<TResult>> {
  const play = await readPlayToken(playToken, playTokenSecret(), now.getTime(), maxTokenAgeMs);
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
  if (!fitsElapsed(play, rules.durationMs(parsed), now.getTime())) {
    return { status: "rejected", reason: "invalid-duration" };
  }
  const value = rules.toValue(parsed);
  if (value !== null && !Number.isSafeInteger(value)) {
    return { status: "rejected", reason: "invalid-result" };
  }

  // 첫 play는 무효여도 내 기록이 된다. 이후에는 값이 있는 결과가 무효(null)를, 게임 방향(better)으로 더 좋은 값이 이긴다.
  // 시도 횟수는 결과와 상관없이 더한다. 한 문장이라 여러 탭이 동시에 저장해도 좋은 쪽이 남고 횟수도 빠지지 않는다.
  const compare = sql.raw(rules.better === "lower" ? "<" : ">");
  const better = sql`excluded.value is not null and (${gameResults.value} is null or excluded.value ${compare} ${gameResults.value})`;
  const keepBetter = (column: AnyColumn, excluded: string) =>
    sql`case when ${better} then ${sql.raw(`excluded.${excluded}`)} else ${column} end`;
  const [best] = await db
    .insert(gameResults)
    .values({
      userId,
      date: play.date,
      gameId: play.gameId,
      gameVersion: rules.version,
      rawResult: parsed,
      value,
      playId: play.playId,
      achievedAt: now,
      attempts,
    })
    .onConflictDoUpdate({
      target: [gameResults.userId, gameResults.date, gameResults.gameId],
      set: {
        gameVersion: keepBetter(gameResults.gameVersion, "game_version"),
        rawResult: keepBetter(gameResults.rawResult, "raw_result"),
        value: keepBetter(gameResults.value, "value"),
        playId: keepBetter(gameResults.playId, "play_id"),
        achievedAt: keepBetter(gameResults.achievedAt, "achieved_at"),
        attempts: sql`${gameResults.attempts} + excluded.attempts`,
      },
    })
    .returning({
      rawResult: gameResults.rawResult,
      value: gameResults.value,
      playId: gameResults.playId,
      attempts: gameResults.attempts,
    });
  if (!best) {
    throw new Error("저장한 내 기록을 읽지 못했어요.");
  }
  const improved = best.playId === play.playId;

  return {
    status: "saved",
    value,
    best: { rawResult: improved ? parsed : rules.parseResult(best.rawResult), value: best.value },
    improved,
    attempts: best.attempts,
  };
}
