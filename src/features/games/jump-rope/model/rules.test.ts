import { describe, expect, it } from "vitest";
import {
  JUMP_SECONDS,
  MAX_SPEED,
  baseSpeedAt,
  jump,
  jumpHeight,
  revolutionSpeed,
  startRope,
  stepRope,
  type Rope,
} from "./rope";
import { MAX_JUMPS, jumpRopeRules } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = jumpRopeRules;
const steady = () => 0.9;

// 다음에 줄이 발밑을 지나기까지 남은 시간(초)
const untilBottom = (rope: Rope) => (Math.ceil(rope.phase - 0.5) + 0.5 - rope.phase) / rope.speed;

// 줄이 발밑에 오기 offset초 전(음수면 후)에 점프를 가운데에 맞추도록 뛰며 n번 넘기를 시도한다.
function play(offset: number, rounds: number) {
  let rope = startRope(steady);
  while (!rope.caught && rope.jumps < rounds) {
    if (rope.jumpedAt === null && untilBottom(rope) - JUMP_SECONDS / 2 + offset <= 0) {
      rope = jump(rope);
    }
    rope = stepRope(rope, steady);
  }
  return rope;
}

describe("rope", () => {
  it("시작하고 1초 넘게 여유가 있고, 뛰지 않으면 첫 줄에 걸린다", () => {
    let rope = startRope(steady);
    while (!rope.caught && rope.time < 5) rope = stepRope(rope, steady);
    expect(rope.caught).toBe(true);
    expect(rope.jumps).toBe(0);
    expect(rope.time).toBeGreaterThan(1);
  });

  it("줄이 발밑에 올 때 맞춰 뛰면 계속 넘는다", () => {
    const rope = play(0, 30);
    expect(rope.caught).toBe(false);
    expect(rope.jumps).toBe(30);
  });

  it("너무 일찍 뛰거나 늦게 뛰면 걸린다", () => {
    expect(play(-0.15, 30).caught).toBe(true);
    expect(play(0.15, 30).caught).toBe(true);
  });

  it("공중에서는 다시 뛸 수 없다", () => {
    const rope = jump(startRope(steady));
    const later = { ...rope, time: rope.time + JUMP_SECONDS / 2 };
    expect(jump(later).jumpedAt).toBe(rope.jumpedAt);
    expect(jumpHeight(later)).toBeCloseTo(1);
  });

  it("넘을수록 빨라지고, 가끔 한 바퀴만 빠르거나 느리게 돈다", () => {
    expect(baseSpeedAt(20)).toBeGreaterThan(baseSpeedAt(0));
    expect(baseSpeedAt(1000)).toBe(MAX_SPEED);
    expect(revolutionSpeed(10, () => 0.9)).toBe(baseSpeedAt(10));
    expect(revolutionSpeed(10, () => 0.1)).toBeLessThan(baseSpeedAt(10));
    const draws = [0.1, 0.9];
    expect(revolutionSpeed(10, () => draws.shift() ?? 0)).toBeGreaterThan(baseSpeedAt(10));
  });
});

describe("jumpRopeRules", () => {
  it("값은 넘은 횟수이고 클수록 좋다", () => {
    const result = parseResult({ jumps: 42, elapsedMs: 40000 });
    expect(result && toValue(result)).toBe(42);
    expect(result && formatResult(result)).toBe("42번");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("higher");
  });

  it("줄이 가장 빨리 돌아도 불가능한 결과와 형식이 틀린 결과는 거부한다", () => {
    expect(parseResult({ jumps: 22, elapsedMs: 10000 })).toBeNull();
    expect(parseResult({ jumps: 10, elapsedMs: 10000 })).not.toBeNull();
    expect(parseResult({ jumps: -1, elapsedMs: 1000 })).toBeNull();
    expect(parseResult({ jumps: 1.5, elapsedMs: 3000 })).toBeNull();
    expect(parseResult({ jumps: 3 })).toBeNull();
    expect(isValidValue(MAX_JUMPS)).toBe(true);
    expect(isValidValue(MAX_JUMPS + 1)).toBe(false);
  });
});
