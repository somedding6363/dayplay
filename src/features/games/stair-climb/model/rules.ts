import type { GameRules } from "@/entities/game";

export interface StairClimbResult {
  // 오른 계단 수. 잘못 누르거나 시간 게이지가 다 떨어지면 그때까지 오른 수로 끝난다.
  steps: number;
  // play를 시작해서 끝낼 때까지.
  elapsedMs: number;
}

// 시간 게이지. 처음에 가득 차 있고, 계속 줄며, 한 칸 오를 때마다 조금 채워진다.
export const GAUGE_MAX_MS = 3000;
export const STEP_BONUS_MS = 350;
// 한 칸을 오르는 데 이보다 빠를 수는 없다고 본다. 결과 검증에 쓴다.
const MIN_MS_PER_STEP = 60;
export const MAX_STEPS = 5000;

// 오를수록 게이지가 빨리 준다. 1이면 실제 시간과 같은 속도다.
export function drainRate(steps: number) {
  return 1 + steps / 150;
}

function isInteger(value: unknown, min: number, max: number): value is number {
  return Number.isInteger(value) && typeof value === "number" && value >= min && value <= max;
}

// 게이지는 1배속 이상으로 줄고 한 칸에 STEP_BONUS_MS만 채워지므로,
// n칸을 오른 play는 GAUGE_MAX_MS + n × STEP_BONUS_MS보다 오래 갈 수 없다.
function parseResult(input: unknown): StairClimbResult | null {
  if (
    typeof input !== "object" ||
    input === null ||
    !("steps" in input) ||
    !("elapsedMs" in input)
  ) {
    return null;
  }
  const { steps, elapsedMs } = input;
  if (
    !isInteger(steps, 0, MAX_STEPS) ||
    !isInteger(elapsedMs, 0, GAUGE_MAX_MS + steps * STEP_BONUS_MS)
  ) {
    return null;
  }
  return steps * MIN_MS_PER_STEP <= elapsedMs ? { steps, elapsedMs } : null;
}

function formatValue(steps: number | null) {
  return steps === null ? "-" : `${steps}계단`;
}

export const stairClimbRules: GameRules<StairClimbResult> = {
  id: "stair-climb",
  name: "무한 계단 오르기",
  instruction: "계단이 꺾이면 방향을 바꿔 오르세요.",
  color: { color: "#3F9A6B", soft: "#DDF1E6", mid: "#A9D8BE", ink: "#1E5A3E" },
  parseResult,
  toValue: ({ steps }) => steps,
  better: "higher",
  isValidValue: (steps) => isInteger(steps, 0, MAX_STEPS),
  durationMs: ({ elapsedMs }) => elapsedMs,
  // 클수록 좋아서 왼쪽 끝(min)을 큰 값으로 둔다.
  distribution: { min: 300, max: 0, bins: 10 },
  formatResult: ({ steps }) => formatValue(steps),
  formatValue,
};
