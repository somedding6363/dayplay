import { describe, expect, it } from "vitest";
import { GAUGE_MAX_MS, MAX_STEPS, STEP_BONUS_MS, drainRate, stairClimbRules } from "./rules";
import { extendStairs, facingAfter } from "./stairs";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = stairClimbRules;

describe("stairs", () => {
  it("계단은 한 칸씩 왼쪽이나 오른쪽으로 이어지고, 필요한 만큼 늘린다", () => {
    const stairs = extendStairs([], 50);
    expect(stairs).toHaveLength(50);
    expect(stairs.every((direction) => direction === 1 || direction === -1)).toBe(true);
    expect(extendStairs(stairs, 80).slice(0, 50)).toEqual(stairs);
  });

  it("무작위 값이 작으면 방향을 바꾼다", () => {
    expect(extendStairs([1], 3, () => 0)).toEqual([1, -1, 1]);
    expect(extendStairs([1], 3, () => 0.9)).toEqual([1, 1, 1]);
  });

  it("오르기는 보는 방향을 유지하고 방향 전환은 반대로 돈다", () => {
    expect(facingAfter(1, "climb")).toBe(1);
    expect(facingAfter(1, "turn")).toBe(-1);
    expect(facingAfter(-1, "turn")).toBe(1);
  });
});

describe("stairClimbRules", () => {
  it("값은 오른 계단 수이고 클수록 좋다", () => {
    const result = parseResult({ steps: 42, elapsedMs: 9000 });
    expect(result && toValue(result)).toBe(42);
    expect(result && formatResult(result)).toBe("42계단");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("higher");
  });

  it("오를수록 게이지가 빨리 준다", () => {
    expect(drainRate(0)).toBe(1);
    expect(drainRate(150)).toBe(2);
  });

  it("받은 시간보다 오래 버틴 결과와 너무 빠른 결과는 거부한다", () => {
    expect(parseResult({ steps: 0, elapsedMs: GAUGE_MAX_MS })).not.toBeNull();
    expect(parseResult({ steps: 0, elapsedMs: GAUGE_MAX_MS + 1 })).toBeNull();
    expect(parseResult({ steps: 10, elapsedMs: GAUGE_MAX_MS + 10 * STEP_BONUS_MS })).not.toBeNull();
    expect(parseResult({ steps: 10, elapsedMs: GAUGE_MAX_MS + 10 * STEP_BONUS_MS + 1 })).toBeNull();
    expect(parseResult({ steps: 10, elapsedMs: 500 })).toBeNull();
    expect(parseResult({ steps: 1.5, elapsedMs: 3000 })).toBeNull();
    expect(parseResult({ steps: 3 })).toBeNull();
    expect(isValidValue(MAX_STEPS)).toBe(true);
    expect(isValidValue(MAX_STEPS + 1)).toBe(false);
  });
});
