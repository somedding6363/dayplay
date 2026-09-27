import "server-only";
import { sql, type AnyColumn } from "drizzle-orm";
import type { GameRules } from "@/entities/game";
import { db } from "@/shared/api";
import { fitsElapsed, readPlayToken, type PlayClaims } from "../model/play-token";
import { gameResults } from "../model/schema";
import { playTokenSecret } from "./play-token-secret";

export type SaveRejectReason =
  "invalid-token" | "game-mismatch" | "invalid-result" | "invalid-duration";

export type SaveGameResult =
  | {
      status: "saved";
      // 이번 play의 값. 무효 결과는 null이다.
      value: number | null;
      // 그날 이 게임의 내 기록 값.
      best: number | null;
      // 이번 play가 내 기록이 되었는지.
      improved: boolean;
      // 그날 이 게임을 끝낸 play 수.
      attempts: number;
    }
  | { status: "rejected"; reason: SaveRejectReason };

type SaveRules = Pick<GameRules<unknown>, "id" | "version" | "better">;

// 첫 play는 무효여도 내 기록이 된다. 이후에는 값이 있는 결과가 무효(null)를, 게임 방향(better)으로 더 좋은 값이 이긴다.
// 시도 횟수는 결과와 상관없이 더한다. neon-http는 대화형 트랜잭션이 없어서 한 문장으로 처리하며,
// 여러 탭이 동시에 저장해도 좋은 쪽이 남고 횟수도 빠지지 않는다.
async function upsertBest(
  userId: string,
  play: PlayClaims,
  rules: SaveRules,
  value: number | null,
  attempts: number,
  now: Date,
): Promise<SaveGameResult> {
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
      value,
      achievedAt: now,
      attempts,
    })
    .onConflictDoUpdate({
      target: [gameResults.userId, gameResults.date, gameResults.gameId],
      set: {
        gameVersion: keepBetter(gameResults.gameVersion, "game_version"),
        value: keepBetter(gameResults.value, "value"),
        achievedAt: keepBetter(gameResults.achievedAt, "achieved_at"),
        attempts: sql`${gameResults.attempts} + excluded.attempts`,
      },
    })
    .returning({
      value: gameResults.value,
      achievedAt: gameResults.achievedAt,
      attempts: gameResults.attempts,
    });
  if (!best) {
    throw new Error("저장한 내 기록을 읽지 못했어요.");
  }

  return {
    status: "saved",
    value,
    best: best.value,
    // 최고 기록 시각이 이번 저장 시각이면 이번 play가 이겼다.
    improved: best.achievedAt.getTime() === now.getTime(),
    attempts: best.attempts,
  };
}

// 토큰이 유효하고 이 게임의 것이면 claims를, 아니면 거부 이유를 돌려준다.
async function readPlayFor(
  gameId: string,
  playToken: string,
  now: Date,
  maxAgeMs?: number,
): Promise<PlayClaims | SaveRejectReason> {
  const play = await readPlayToken(playToken, playTokenSecret(), now.getTime(), maxAgeMs);
  if (!play) {
    return "invalid-token";
  }
  return play.gameId === gameId ? play : "game-mismatch";
}

interface SaveInput {
  userId: string;
  playToken: string;
  result: unknown;
}

// 모든 게임이 같이 쓰는 저장 흐름. 게임마다 다른 검증과 비교 값은 rules가 맡는다.
// 결과는 검증하고 값만 저장한다. 무효도 값이 null인 하나의 결과라 같은 흐름으로 저장한다.
export async function saveGameResult<TResult>(
  { userId, playToken, result }: SaveInput,
  rules: SaveRules & Pick<GameRules<TResult>, "parseResult" | "toValue" | "durationMs">,
  now = new Date(),
): Promise<SaveGameResult> {
  const play = await readPlayFor(rules.id, playToken, now);
  if (typeof play === "string") {
    return { status: "rejected", reason: play };
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
  return upsertBest(userId, play, rules, value, 1, now);
}

// 로그인 직후 병합은 결과를 끝낸 뒤 한참 지나 오므로 토큰을 하루까지 인정한다.
const MERGE_TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface MergeInput {
  userId: string;
  playToken: string;
  // 브라우저가 계산한 값과 횟수라 서버가 결과를 다시 계산할 수 없다. 범위만 검증한다.
  value: number | null;
  attempts: number;
}

// 로그인 직후 브라우저 임시 기록을 계정에 더한다.
export async function mergeGameValue(
  { userId, playToken, value, attempts }: MergeInput,
  rules: SaveRules & Pick<GameRules<unknown>, "isValidValue">,
  now = new Date(),
): Promise<SaveGameResult> {
  const play = await readPlayFor(rules.id, playToken, now, MERGE_TOKEN_MAX_AGE_MS);
  if (typeof play === "string") {
    return { status: "rejected", reason: play };
  }
  if (value !== null && !rules.isValidValue(value)) {
    return { status: "rejected", reason: "invalid-result" };
  }
  return upsertBest(userId, play, rules, value, attempts, now);
}
