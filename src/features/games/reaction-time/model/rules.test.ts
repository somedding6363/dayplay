import { describe, expect, it } from "vitest";
import {
  REACTION_MIN_MS,
  REACTION_TIMEOUT_MS,
  WAIT_MAX_MS,
  WAIT_MIN_MS,
  randomWaitMs,
  reactionTimeRules,
  toReactionMs,
} from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue } = reactionTimeRules;

describe("toReactionMs", () => {
  it("신호부터 입력까지의 시간을 정수 ms로 바꾼다", () => {
    expect(toReactionMs(187.4)).toBe(187);
  });

  it("0ms만 무효이고 1ms부터 기록한다", () => {
    expect(toReactionMs(0)).toBeNull();
    expect(toReactionMs(0.4)).toBeNull();
    expect(toReactionMs(0.6)).toBe(1);
    expect(toReactionMs(REACTION_MIN_MS)).toBe(1);
  });

  it("제한 시간을 넘기면 무효다", () => {
    expect(toReactionMs(REACTION_TIMEOUT_MS)).toBe(REACTION_TIMEOUT_MS);
    expect(toReactionMs(REACTION_TIMEOUT_MS + 1)).toBeNull();
  });
});

describe("randomWaitMs", () => {
  it("대기 시간은 정해진 범위 안이다", () => {
    for (let i = 0; i < 1000; i += 1) {
      const wait = randomWaitMs();
      expect(wait).toBeGreaterThanOrEqual(WAIT_MIN_MS);
      expect(wait).toBeLessThan(WAIT_MAX_MS);
    }
  });
});

describe("reactionTimeRules", () => {
  it("정상 결과는 값이 ms이고 ms로 표시한다", () => {
    const result = parseResult({ ms: 187, elapsedMs: 3187 });
    expect(result).toEqual({ ms: 187, elapsedMs: 3187 });
    expect(result && toValue(result)).toBe(187);
    expect(result && formatResult(result)).toBe("187ms");
  });

  it("무효 결과는 값이 null이고 -로 표시한다", () => {
    const result = parseResult({ ms: null, elapsedMs: 800 });
    expect(result).toEqual({ ms: null, elapsedMs: 800 });
    expect(result && toValue(result)).toBeNull();
    expect(result && formatResult(result)).toBe("-");
  });

  it("저장된 값만으로 표시하고 범위를 검증한다", () => {
    expect(formatValue(187)).toBe("187ms");
    expect(formatValue(null)).toBe("-");
    expect(isValidValue(1)).toBe(true);
    expect(isValidValue(REACTION_TIMEOUT_MS)).toBe(true);
    expect(isValidValue(0)).toBe(false);
    expect(isValidValue(REACTION_TIMEOUT_MS + 1)).toBe(false);
    expect(isValidValue(187.5)).toBe(false);
  });

  it("작을수록 좋은 기록이다", () => {
    expect(reactionTimeRules.better).toBe("lower");
  });

  it("불가능한 결과는 거부한다", () => {
    expect(parseResult({ ms: 0, elapsedMs: 3000 })).toBeNull();
    expect(parseResult({ ms: 187.5, elapsedMs: 3000 })).toBeNull();
    expect(parseResult({ ms: REACTION_TIMEOUT_MS + 1, elapsedMs: 20_000 })).toBeNull();
    expect(parseResult({ ms: "187", elapsedMs: 3000 })).toBeNull();
    expect(parseResult({ ms: 187 })).toBeNull();
    expect(parseResult({ ms: 187, elapsedMs: -1 })).toBeNull();
    expect(parseResult(null)).toBeNull();
  });

  it("최소 대기 시간을 기다리지 않은 정상 결과는 거부한다", () => {
    expect(parseResult({ ms: 187, elapsedMs: 1000 })).toBeNull();
  });
});
