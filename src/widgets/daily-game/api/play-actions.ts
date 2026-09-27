"use server";

import { dailySchedule, getDailyGames } from "@/entities/daily-game";
import { issuePlayToken, saveGameResult, type SaveGameResult } from "@/entities/record/server";
import { auth } from "@/features/auth/server";
import { reactionTime } from "@/features/games/reaction-time";
import { todayKey } from "@/shared/lib";

interface SaveInput {
  userId: string;
  playToken: string;
  result: unknown;
}

// 게임마다 결과 타입이 달라서 rules를 감싼 저장 함수로 등록한다.
const savers = new Map<string, (input: SaveInput) => Promise<SaveGameResult<unknown>>>([
  [reactionTime.id, (input) => saveGameResult(input, reactionTime)],
]);

export type FinishPlayResult = SaveGameResult<unknown> | { status: "signed-out" };

// 오늘 열린 게임이면 play 토큰을 발급한다. 로그인하지 않아도 받는다.
export async function startPlay(gameId: string): Promise<string | null> {
  const today = todayKey();
  const isOpen = getDailyGames(dailySchedule, today).some((game) => game.gameId === gameId);
  if (!savers.has(gameId) || !isOpen) {
    return null;
  }
  return issuePlayToken(gameId, today);
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
  const save = savers.get(gameId);
  if (!save) {
    return { status: "rejected", reason: "game-mismatch" };
  }
  if (typeof playToken !== "string") {
    return { status: "rejected", reason: "invalid-token" };
  }
  return save({ userId: session.user.id, playToken, result });
}
