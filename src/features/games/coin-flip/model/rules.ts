import type { GameRules } from "@/entities/game";

export type CoinSide = "heads" | "tails";

export interface CoinFlipResult {
  // 연속으로 맞힌 횟수. 틀리면 그때까지 맞힌 횟수로 끝난다.
  streak: number;
  // play를 시작해서 끝낼 때까지.
  elapsedMs: number;
}

// 고른 뒤 결과가 나오기까지의 시간. 동전이 떠올랐다 탁자로 떨어지는 동안이며 이 시간보다 빨리 던질 수는 없다.
export const FLIP_MS = 1200;
// 연속으로 맞힐 확률이 2^-n이라 이 이상은 사실상 나오지 않는다. 결과 검증에 쓴다.
export const MAX_STREAK = 100;
// play 토큰 유효 기간(1시간)보다 오래 걸린 결과는 서버가 받지 않는다.
const MAX_ELAPSED_MS = 60 * 60 * 1000;

export const coinSideName: Record<CoinSide, string> = { heads: "앞면", tails: "뒷면" };

export function flipCoin(random = Math.random): CoinSide {
  return random() < 0.5 ? "heads" : "tails";
}

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

// 동전 결과는 브라우저가 정해서 서버가 다시 확인할 수 없다. 던진 횟수만큼 시간이 지났는지만 본다.
function parseResult(input: unknown): CoinFlipResult | null {
  if (
    typeof input !== "object" ||
    input === null ||
    !("streak" in input) ||
    !("elapsedMs" in input)
  ) {
    return null;
  }
  const { streak, elapsedMs } = input;
  if (!isInteger(streak, 0, MAX_STREAK) || !isInteger(elapsedMs, 0, MAX_ELAPSED_MS)) {
    return null;
  }
  // 틀린 마지막 한 번까지 streak + 1번 던졌다.
  return (streak + 1) * FLIP_MS <= elapsedMs ? { streak, elapsedMs } : null;
}

function formatValue(streak: number | null) {
  return streak === null ? "-" : `${streak}연속`;
}

export const coinFlipRules: GameRules<CoinFlipResult> = {
  id: "coin-flip",
  name: "동전 앞뒤 맞추기",
  instruction: "앞면일지 뒷면일지 고르세요.",
  color: { color: "#D4537E", soft: "#FBE6EE", mid: "#F2BED1", ink: "#7A2444" },
  parseResult,
  toValue: ({ streak }) => streak,
  better: "higher",
  isValidValue: (streak) => isInteger(streak, 0, MAX_STREAK),
  durationMs: ({ elapsedMs }) => elapsedMs,
  // 클수록 좋아서 왼쪽 끝(min)을 큰 값으로 둔다.
  distribution: { min: 10, max: 0, bins: 10 },
  formatResult: ({ streak }) => formatValue(streak),
  formatValue,
};
