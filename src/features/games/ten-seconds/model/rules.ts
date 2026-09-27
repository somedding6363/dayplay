import type { GameRules } from "@/entities/game";

export interface TenSecondsResult {
  // 시작부터 멈춘 입력까지. 제한 시간 안에 멈추지 않으면 null(무효).
  elapsedMs: number | null;
}

export const TARGET_MS = 10_000;
// 경과 시간을 보여주는 시간. 이후에는 가린다.
export const VISIBLE_MS = 3000;
export const TIMEOUT_MS = 20_000;

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

// 시작부터 입력까지의 시간을 결과로 바꾼다. 제한 시간을 넘기면 무효.
export function toElapsedMs(gapMs: number) {
  const ms = Math.round(gapMs);
  return ms >= 1 && ms <= TIMEOUT_MS ? ms : null;
}

// 0.01초 단위로 반올림한 "9.92"
export function formatSeconds(ms: number) {
  return (Math.round(ms / 10) / 100).toFixed(2);
}

function parseResult(input: unknown): TenSecondsResult | null {
  if (typeof input !== "object" || input === null || !("elapsedMs" in input)) {
    return null;
  }
  const { elapsedMs } = input;
  if (elapsedMs === null) {
    return { elapsedMs };
  }
  return isInteger(elapsedMs, 1, TIMEOUT_MS) ? { elapsedMs } : null;
}

function formatValue(errorMs: number | null) {
  return errorMs === null ? "-" : `±${formatSeconds(errorMs)}초`;
}

export const tenSecondsRules: GameRules<TenSecondsResult> = {
  id: "ten-seconds",
  name: "10초 맞추기",
  instruction: "정확히 10초에 멈추세요.",
  color: { color: "#4F7FD6", soft: "#E3ECFB", mid: "#B9CDF1", ink: "#22467A" },
  parseResult,
  // 10초와의 차이(절댓값). 작을수록 좋다.
  toValue: ({ elapsedMs }) => (elapsedMs === null ? null : Math.abs(elapsedMs - TARGET_MS)),
  better: "lower",
  isValidValue: (errorMs) => isInteger(errorMs, 0, TIMEOUT_MS - TARGET_MS),
  durationMs: ({ elapsedMs }) => elapsedMs ?? TIMEOUT_MS,
  distribution: { min: 0, max: 1000, bins: 10, labels: ["정확", "벗어남"] },
  formatResult: ({ elapsedMs }) => (elapsedMs === null ? "-" : `${formatSeconds(elapsedMs)}초`),
  formatValue,
};
