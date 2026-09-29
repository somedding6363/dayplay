import type { GameRules } from "@/entities/game";
import { LAPS, MAX_SPEED, trackLength } from "./track";

export interface RacingResult {
  // 세 바퀴를 도는 데 걸린 시간. 벽에 부딪혀도 튕겨 나와 계속 달려서 중간에 끝나지 않는다.
  ms: number;
}

// play 토큰 유효 기간(1시간)보다 오래 걸린 결과는 서버가 받지 않는다.
export const MAX_MS = 60 * 60 * 1000;
// 가운데 선을 최고 속도로 달려도 이보다 빨리 돌 수 없다. 결과 검증에 쓴다.
// 코너 안쪽으로 붙으면 가운데 선보다 짧게 돌 수 있어 여유를 둔다.
export const MIN_MS = Math.floor(((LAPS * trackLength) / MAX_SPEED) * 1000 * 0.8);

function isValidMs(value: unknown): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= MIN_MS && value <= MAX_MS;
}

function parseResult(input: unknown): RacingResult | null {
  if (typeof input !== "object" || input === null || !("ms" in input)) {
    return null;
  }
  return isValidMs(input.ms) ? { ms: input.ms } : null;
}

function formatValue(ms: number | null) {
  return ms === null ? "-" : `${(ms / 1000).toFixed(3)}초`;
}

export const racingRules: GameRules<RacingResult> = {
  id: "racing",
  name: "레이싱",
  instruction: "트랙을 세 바퀴 도세요.",
  color: { color: "#D39A2C", soft: "#FBF0DA", mid: "#EFD29B", ink: "#6E4A12" },
  parseResult,
  toValue: ({ ms }) => ms,
  better: "lower",
  isValidValue: isValidMs,
  durationMs: ({ ms }) => ms,
  // 첫 칸은 40초 미만, 그다음부터 5초 간격(40~45초, 45~50초 …), 마지막 칸은 80초 이상이다.
  distribution: { min: 35_000, max: 85_000, bins: 10 },
  formatResult: ({ ms }) => formatValue(ms),
  formatValue,
};
