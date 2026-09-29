import { describe, expect, it } from "vitest";
import { MAX_SPEED } from "./flight";
import { MAX_DISTANCE, paperPlaneRules } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = paperPlaneRules;

describe("paperPlaneRules", () => {
  it("값은 날아간 거리(m)이고 클수록 좋다", () => {
    const result = parseResult({ distance: 1234, elapsedMs: 30000 });
    expect(result && toValue(result)).toBe(1234);
    expect(result && formatResult(result)).toBe("1234m");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("higher");
  });

  it("가장 빠른 속도로도 갈 수 없는 거리와 형식이 틀린 결과는 거부한다", () => {
    expect(parseResult({ distance: MAX_SPEED * 10, elapsedMs: 10000 })).not.toBeNull();
    expect(parseResult({ distance: MAX_SPEED * 10 + 1, elapsedMs: 10000 })).toBeNull();
    expect(parseResult({ distance: -1, elapsedMs: 1000 })).toBeNull();
    expect(parseResult({ distance: 1.5, elapsedMs: 1000 })).toBeNull();
    expect(parseResult({ distance: 10 })).toBeNull();
    expect(isValidValue(MAX_DISTANCE)).toBe(true);
    expect(isValidValue(MAX_DISTANCE + 1)).toBe(false);
  });
});
