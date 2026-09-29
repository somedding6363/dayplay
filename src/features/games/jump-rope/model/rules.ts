import type { GameRules } from "@/entities/game";
import { MAX_SPEED } from "./rope";

export interface JumpRopeResult {
  // 넘은 횟수. 줄에 걸리면 그때까지의 횟수로 끝난다.
  jumps: number;
  // play를 시작해서 끝낼 때까지.
  elapsedMs: number;
}

export const MAX_JUMPS = 10_000;
// 줄은 가장 빨라도 한 바퀴에 1 / MAX_SPEED초가 걸린다. 결과 검증에 쓴다.
const MIN_MS_PER_JUMP = Math.floor(1000 / MAX_SPEED);
// play 토큰 유효 기간(1시간)보다 오래 걸린 결과는 서버가 받지 않는다.
const MAX_ELAPSED_MS = 60 * 60 * 1000;

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

function parseResult(input: unknown): JumpRopeResult | null {
  if (
    typeof input !== "object" ||
    input === null ||
    !("jumps" in input) ||
    !("elapsedMs" in input)
  ) {
    return null;
  }
  const { jumps, elapsedMs } = input;
  if (!isInteger(jumps, 0, MAX_JUMPS) || !isInteger(elapsedMs, 0, MAX_ELAPSED_MS)) {
    return null;
  }
  return jumps * MIN_MS_PER_JUMP <= elapsedMs ? { jumps, elapsedMs } : null;
}

function formatValue(jumps: number | null) {
  return jumps === null ? "-" : `${jumps}번`;
}

export const jumpRopeRules: GameRules<JumpRopeResult> = {
  id: "jump-rope",
  name: "줄넘기",
  instruction: "줄이 발밑에 올 때 뛰어넘으세요.",
  color: { color: "#B24FC4", soft: "#F5E5F8", mid: "#E3B8EC", ink: "#5E1F6B" },
  parseResult,
  toValue: ({ jumps }) => jumps,
  better: "higher",
  isValidValue: (jumps) => isInteger(jumps, 0, MAX_JUMPS),
  durationMs: ({ elapsedMs }) => elapsedMs,
  // 클수록 좋아서 왼쪽 끝(min)을 큰 값으로 둔다. 100번부터 10번 간격 10칸
  distribution: { min: 100, max: 0, bins: 10 },
  formatResult: ({ jumps }) => formatValue(jumps),
  formatValue,
};
