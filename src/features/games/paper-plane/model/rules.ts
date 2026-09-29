import type { GameRules } from "@/entities/game";
import { MAX_SPEED } from "./flight";

export interface PaperPlaneResult {
  // 부딪히기 전까지 날아간 거리(m). 부딪혀야 끝나고 무효는 없다.
  distance: number;
  // play를 시작해서 끝낼 때까지.
  elapsedMs: number;
}

// play 토큰 유효 기간(1시간)보다 오래 걸린 결과는 서버가 받지 않는다.
const MAX_ELAPSED_MS = 60 * 60 * 1000;
export const MAX_DISTANCE = (MAX_SPEED * MAX_ELAPSED_MS) / 1000;

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

// 가장 빠른 속도로 날아도 걸린 시간보다 멀리 갈 수 없다.
function parseResult(input: unknown): PaperPlaneResult | null {
  if (
    typeof input !== "object" ||
    input === null ||
    !("distance" in input) ||
    !("elapsedMs" in input)
  ) {
    return null;
  }
  const { distance, elapsedMs } = input;
  if (!isInteger(distance, 0, MAX_DISTANCE) || !isInteger(elapsedMs, 0, MAX_ELAPSED_MS)) {
    return null;
  }
  return distance <= Math.ceil((MAX_SPEED * elapsedMs) / 1000) ? { distance, elapsedMs } : null;
}

function formatValue(distance: number | null) {
  return distance === null ? "-" : `${distance}m`;
}

export const paperPlaneRules: GameRules<PaperPlaneResult> = {
  id: "paper-plane",
  name: "종이비행기",
  instruction: "건물을 피해 최대한 멀리 날리세요.",
  color: { color: "#2F9AA6", soft: "#DDF1F3", mid: "#A6D8DE", ink: "#1B5961" },
  parseResult,
  toValue: ({ distance }) => distance,
  better: "higher",
  isValidValue: (distance) => isInteger(distance, 0, MAX_DISTANCE),
  durationMs: ({ elapsedMs }) => elapsedMs,
  // 클수록 좋아서 왼쪽 끝(min)을 큰 값으로 둔다. 200m 간격 10칸이고 양 끝 칸이 범위 밖을 담아
  // 2000m 이상, 1800~2000m, …, 400~600m, 400m 미만으로 나뉜다.
  distribution: { min: 2200, max: 200, bins: 10 },
  formatResult: ({ distance }) => formatValue(distance),
  formatValue,
};
