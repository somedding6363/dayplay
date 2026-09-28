"use server";

import { dailySchedule, getDailyGames } from "@/entities/daily-game";
import {
  issuePlayToken,
  mergeGameValue,
  saveGameResult,
  type SaveGameResult,
} from "@/entities/record/server";
import { auth } from "@/features/auth/server";
import { oddColor } from "@/features/games/odd-color";
import { reactionTime } from "@/features/games/reaction-time";
import { stairClimb } from "@/features/games/stair-climb";
import { tenSeconds } from "@/features/games/ten-seconds";
import { todayKey } from "@/shared/lib";

interface SaveInput {
  userId: string;
  playToken: string;
  result: unknown;
}

interface MergeInput {
  userId: string;
  playToken: string;
  value: number | null;
  attempts: number;
}

interface GameSaver {
  save: (input: SaveInput) => Promise<SaveGameResult>;
  merge: (input: MergeInput) => Promise<SaveGameResult>;
}

// 게임마다 결과 타입이 달라서 rules를 감싼 저장 함수로 등록한다.
const savers = new Map<string, GameSaver>([
  [
    reactionTime.id,
    {
      save: (input) => saveGameResult(input, reactionTime),
      merge: (input) => mergeGameValue(input, reactionTime),
    },
  ],
  [
    tenSeconds.id,
    {
      save: (input) => saveGameResult(input, tenSeconds),
      merge: (input) => mergeGameValue(input, tenSeconds),
    },
  ],
  [
    oddColor.id,
    {
      save: (input) => saveGameResult(input, oddColor),
      merge: (input) => mergeGameValue(input, oddColor),
    },
  ],
  [
    stairClimb.id,
    {
      save: (input) => saveGameResult(input, stairClimb),
      merge: (input) => mergeGameValue(input, stairClimb),
    },
  ],
]);

const MERGE_MAX_RECORDS = 20;
// 브라우저가 센 횟수라 서버가 확인할 수 없다. 틀어져도 시도 횟수만 바뀌므로 범위만 제한한다.
const MERGE_MAX_ATTEMPTS = 1000;

type FinishPlayResult = SaveGameResult | { status: "signed-out" };

export interface StartedPlay {
  playToken: string;
  // 판정 날짜. 비로그인 기록을 이 날짜로 저장한다.
  date: string;
}

// 오늘 열린 게임이면 play 토큰을 발급한다. 로그인하지 않아도 받는다.
export async function startPlay(gameId: string): Promise<StartedPlay | null> {
  const today = todayKey();
  const isOpen = getDailyGames(dailySchedule, today).some((game) => game.gameId === gameId);
  if (!savers.has(gameId) || !isOpen) {
    return null;
  }
  return { playToken: await issuePlayToken(gameId, today), date: today };
}

// Server Function은 누구나 직접 호출할 수 있어서 인자를 모두 다시 검증한다.
export async function finishPlay(
  gameId: string,
  playToken: string,
  result: unknown,
): Promise<FinishPlayResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "signed-out" };
  }
  const saver = savers.get(gameId);
  if (!saver) {
    return { status: "rejected", reason: "game-mismatch" };
  }
  if (typeof playToken !== "string") {
    return { status: "rejected", reason: "invalid-token" };
  }
  return saver.save({ userId: session.user.id, playToken, result });
}

export interface MergedRecord {
  id: string;
  // 계정에 저장됐으면 true. 이 기록은 브라우저에서 지워도 된다.
  stored: boolean;
}

// 로그인 직후 이 브라우저의 오늘 기록을 계정에 저장한다. 지난 날짜 기록은 받지 않는다.
export async function mergeLocalRecords(records: unknown): Promise<MergedRecord[]> {
  const session = await auth();
  if (!session?.user?.id || !Array.isArray(records)) {
    return [];
  }
  const userId = session.user.id;
  const today = todayKey();
  const merged: MergedRecord[] = [];

  for (const record of records.slice(0, MERGE_MAX_RECORDS)) {
    if (
      typeof record !== "object" ||
      record === null ||
      !("id" in record) ||
      typeof record.id !== "string" ||
      !("date" in record) ||
      record.date !== today ||
      !("gameId" in record) ||
      typeof record.gameId !== "string" ||
      !("playToken" in record) ||
      typeof record.playToken !== "string" ||
      !("value" in record) ||
      (record.value !== null && typeof record.value !== "number") ||
      !("attempts" in record) ||
      typeof record.attempts !== "number" ||
      !Number.isInteger(record.attempts) ||
      record.attempts < 1 ||
      record.attempts > MERGE_MAX_ATTEMPTS
    ) {
      continue;
    }
    const saver = savers.get(record.gameId);
    if (!saver) {
      continue;
    }
    const saved = await saver.merge({
      userId,
      playToken: record.playToken,
      value: record.value,
      attempts: record.attempts,
    });
    merged.push({ id: record.id, stored: saved.status === "saved" });
  }
  return merged;
}
