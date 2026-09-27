import type { GameRules } from "@/entities/game";

export interface OddColorResult {
  // 찾은 개수. 틀린 칸을 누르거나 시간이 끝나면 그때까지 찾은 개수로 끝난다.
  found: number;
  // play를 시작해서 끝낼 때까지.
  elapsedMs: number;
}

// 단계마다 새로 주는 시간. 이 안에 찾지 못하면 끝난다.
export const LEVEL_TIME_MS = 15_000;
// 폰에서 칸이 너무 작아지지 않도록 8×8에서 멈춘다.
export const MAX_GRID_SIZE = 8;
// 한 칸을 찾는 데 이보다 빠를 수는 없다고 본다. 결과 검증에 쓴다.
const MIN_MS_PER_FIND = 100;
// 단계는 끝이 없지만 검증에 상한을 둔다. 사람이 1시간(토큰 유효 기간) 안에 넘기기 어려운 값이다.
export const MAX_FOUND = 1000;

// 1단계는 2×2이고 단계마다 한 줄씩 늘어 8×8에서 멈춘다. 단계는 끝이 없다.
export function gridSize(level: number) {
  return Math.min(level + 1, MAX_GRID_SIZE);
}

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

function parseResult(input: unknown): OddColorResult | null {
  if (
    typeof input !== "object" ||
    input === null ||
    !("found" in input) ||
    !("elapsedMs" in input)
  ) {
    return null;
  }
  const { found, elapsedMs } = input;
  if (!isInteger(found, 0, MAX_FOUND) || !isInteger(elapsedMs, 0, (found + 1) * LEVEL_TIME_MS)) {
    return null;
  }
  return found * MIN_MS_PER_FIND <= elapsedMs ? { found, elapsedMs } : null;
}

function formatValue(found: number | null) {
  return found === null ? "-" : `${found}개`;
}

export const oddColorRules: GameRules<OddColorResult> = {
  id: "odd-color",
  name: "다른 색상 찾기",
  instruction: "색이 다른 칸을 찾으세요.",
  color: { color: "#8B6BD6", soft: "#ECE6FA", mid: "#CDBEF0", ink: "#45307A" },
  parseResult,
  toValue: ({ found }) => found,
  better: "higher",
  isValidValue: (found) => isInteger(found, 0, MAX_FOUND),
  durationMs: ({ elapsedMs }) => elapsedMs,
  // 클수록 좋아서 왼쪽 끝(min)을 큰 값으로 둔다.
  distribution: { min: 60, max: 0, bins: 10 },
  formatResult: ({ found }) => formatValue(found),
  formatValue,
};
