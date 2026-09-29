import type { GameRules } from "@/entities/game";

export interface PoopDodgeResult {
  // 똥에 맞기 전까지 버틴 시간. 맞아야 끝나고 무효는 없다.
  ms: number;
}

// play 토큰 유효 기간(1시간)보다 오래 걸린 결과는 서버가 받지 않는다.
export const MAX_MS = 60 * 60 * 1000;

function isValidMs(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= 0 && value <= MAX_MS;
}

function parseResult(input: unknown): PoopDodgeResult | null {
  if (typeof input !== "object" || input === null || !("ms" in input)) {
    return null;
  }
  return isValidMs(input.ms) ? { ms: input.ms } : null;
}

function formatValue(ms: number | null) {
  return ms === null ? "-" : `${(ms / 1000).toFixed(3)}초`;
}

export const poopDodgeRules: GameRules<PoopDodgeResult> = {
  id: "poop-dodge",
  name: "똥피하기",
  instruction: "떨어지는 똥을 피하세요.",
  color: { color: "#9A6A3E", soft: "#F6EEE5", mid: "#E3CCB2", ink: "#4B3322" },
  parseResult,
  toValue: ({ ms }) => ms,
  better: "higher",
  isValidValue: isValidMs,
  durationMs: ({ ms }) => ms,
  // 클수록 좋아서 왼쪽 끝(min)을 큰 값으로 둔다. 30초부터 3초 간격 10칸
  distribution: { min: 30_000, max: 0, bins: 10 },
  formatResult: ({ ms }) => formatValue(ms),
  formatValue,
};
