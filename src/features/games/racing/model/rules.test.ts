import { describe, expect, it } from "vitest";
import { MAX_MS, MIN_MS, racingRules } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = racingRules;

describe("racingRules", () => {
  it("값은 세 바퀴 기록(ms)이고 작을수록 좋다", () => {
    const result = parseResult({ ms: 52456 });
    expect(result && toValue(result)).toBe(52456);
    expect(result && formatResult(result)).toBe("52.456초");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("lower");
  });

  it("불가능한 결과는 거부한다", () => {
    expect(parseResult({ ms: MIN_MS - 1 })).toBeNull();
    expect(parseResult({ ms: MIN_MS })).not.toBeNull();
    expect(parseResult({ ms: MAX_MS + 1 })).toBeNull();
    expect(parseResult({ ms: null })).toBeNull();
    expect(parseResult({ ms: 50000.5 })).toBeNull();
    expect(parseResult({})).toBeNull();
    expect(isValidValue(MAX_MS)).toBe(true);
    expect(isValidValue(MIN_MS - 1)).toBe(false);
  });
});
