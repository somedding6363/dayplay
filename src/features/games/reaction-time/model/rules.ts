import type { GameRules } from "@/entities/game";

export interface ReactionTimeResult {
  // 신호부터 입력까지. 무효(신호 전 입력, 0ms, 시간 초과, 탭 이탈)는 null.
  ms: number | null;
  // play를 시작해서 끝낼 때까지. 서버가 토큰 발급 후 경과 시간과 대조한다.
  elapsedMs: number;
}

export const WAIT_MIN_MS = 2000;
export const WAIT_MAX_MS = 5000;
// 타이밍을 맞춰 누른 것도 기록으로 인정한다. 0ms만 신호와 동시에 누른 것으로 보고 무효로 한다.
export const REACTION_MIN_MS = 1;
export const REACTION_TIMEOUT_MS = 10_000;

// 대기 중 입력으로 끝나면 elapsedMs가 WAIT_MIN_MS보다 짧을 수 있다.
const ELAPSED_MAX_MS = WAIT_MAX_MS + REACTION_TIMEOUT_MS + 1000;

export function randomWaitMs() {
  return WAIT_MIN_MS + Math.floor(Math.random() * (WAIT_MAX_MS - WAIT_MIN_MS));
}

// 신호부터 입력까지의 시간을 결과 값으로 바꾼다. 범위 밖이면 무효(null).
export function toReactionMs(gapMs: number) {
  const ms = Math.round(gapMs);
  return ms >= REACTION_MIN_MS && ms <= REACTION_TIMEOUT_MS ? ms : null;
}

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

function parseResult(input: unknown): ReactionTimeResult | null {
  if (typeof input !== "object" || input === null || !("ms" in input) || !("elapsedMs" in input)) {
    return null;
  }
  const { ms, elapsedMs } = input;
  if (!isInteger(elapsedMs, 0, ELAPSED_MAX_MS)) {
    return null;
  }
  if (ms === null) {
    return { ms, elapsedMs };
  }
  if (!isInteger(ms, REACTION_MIN_MS, REACTION_TIMEOUT_MS) || elapsedMs < WAIT_MIN_MS + ms) {
    return null;
  }
  return { ms, elapsedMs };
}

function formatValue(ms: number | null) {
  return ms === null ? "-" : `${ms}ms`;
}

export const reactionTimeRules: GameRules<ReactionTimeResult> = {
  id: "reaction-time",
  version: 1,
  name: "반응속도",
  instruction: "색이 바뀌면 누르세요.",
  color: { color: "#E4704F", soft: "#FBE6DD", mid: "#F3C3B1", ink: "#8A3A22" },
  parseResult,
  toValue: ({ ms }) => ms,
  better: "lower",
  isValidValue: (ms) => isInteger(ms, REACTION_MIN_MS, REACTION_TIMEOUT_MS),
  durationMs: ({ elapsedMs }) => elapsedMs,
  distribution: { min: 100, max: 600, bins: 10, labels: ["빠름", "느림"] },
  formatResult: ({ ms }) => formatValue(ms),
  formatValue,
};
