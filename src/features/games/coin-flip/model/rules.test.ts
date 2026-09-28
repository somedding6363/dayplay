import { describe, expect, it } from "vitest";
import { FLIP_MS, MAX_STREAK, coinFlipRules, flipCoin } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = coinFlipRules;

describe("flipCoin", () => {
  it("무작위 값의 절반을 기준으로 앞면과 뒷면이 나온다", () => {
    expect(flipCoin(() => 0.1)).toBe("heads");
    expect(flipCoin(() => 0.9)).toBe("tails");
  });
});

describe("coinFlipRules", () => {
  it("값은 연속으로 맞힌 횟수이고 클수록 좋다", () => {
    const result = parseResult({ streak: 5, elapsedMs: 15_000 });
    expect(result && toValue(result)).toBe(5);
    expect(result && formatResult(result)).toBe("5연속");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("higher");
  });

  it("첫 번째에 틀려도 0연속이다", () => {
    expect(parseResult({ streak: 0, elapsedMs: FLIP_MS })).toEqual({
      streak: 0,
      elapsedMs: FLIP_MS,
    });
  });

  it("던진 횟수만큼 시간이 지나지 않은 결과와 불가능한 값은 거부한다", () => {
    expect(parseResult({ streak: 5, elapsedMs: 6 * FLIP_MS })).not.toBeNull();
    expect(parseResult({ streak: 5, elapsedMs: 6 * FLIP_MS - 1 })).toBeNull();
    expect(parseResult({ streak: MAX_STREAK + 1, elapsedMs: 3_600_000 })).toBeNull();
    expect(parseResult({ streak: 1.5, elapsedMs: 5000 })).toBeNull();
    expect(parseResult({ streak: 3 })).toBeNull();
    expect(isValidValue(MAX_STREAK)).toBe(true);
    expect(isValidValue(MAX_STREAK + 1)).toBe(false);
  });
});
