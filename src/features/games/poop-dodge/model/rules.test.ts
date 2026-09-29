import { describe, expect, it } from "vitest";
import { MAX_MS, poopDodgeRules } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = poopDodgeRules;

describe("poopDodgeRules", () => {
  it("값은 버틴 시간(ms)이고 클수록 좋다", () => {
    const result = parseResult({ ms: 23456 });
    expect(result && toValue(result)).toBe(23456);
    expect(result && formatResult(result)).toBe("23.456초");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("higher");
  });

  it("불가능한 결과는 거부한다", () => {
    expect(parseResult({ ms: 0 })).not.toBeNull();
    expect(parseResult({ ms: -1 })).toBeNull();
    expect(parseResult({ ms: MAX_MS + 1 })).toBeNull();
    expect(parseResult({ ms: 1000.5 })).toBeNull();
    expect(parseResult({})).toBeNull();
    expect(isValidValue(MAX_MS)).toBe(true);
    expect(isValidValue(-1)).toBe(false);
  });
});
