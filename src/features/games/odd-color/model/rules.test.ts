import { describe, expect, it } from "vitest";
import { levelColors } from "./palette";
import { LEVEL_TIME_MS, MAX_FOUND, MAX_GRID_SIZE, gridSize, oddColorRules } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, durationMs, better } =
  oddColorRules;

describe("gridSize", () => {
  it("2×2에서 시작해 단계마다 한 줄씩 늘고 8×8에서 멈춘다", () => {
    expect([1, 2, 3, 4].map(gridSize)).toEqual([2, 3, 4, 5]);
    expect(MAX_GRID_SIZE).toBe(8);
    expect(gridSize(7)).toBe(8);
    expect(gridSize(8)).toBe(8);
    expect(gridSize(50)).toBe(MAX_GRID_SIZE);
  });
});

describe("levelColors", () => {
  it("같은 단계는 언제나 같은 색이고, 다른 칸은 바탕과 다르다", () => {
    expect(levelColors(3)).toEqual(levelColors(3));
    for (let level = 1; level <= 40; level += 1) {
      const { base, odd } = levelColors(level);
      expect(odd, `${level}단계`).not.toBe(base);
    }
  });
});

describe("oddColorRules", () => {
  it("값은 찾은 개수이고 클수록 좋다", () => {
    const result = parseResult({ found: 12, elapsedMs: 40_000 });
    expect(result && toValue(result)).toBe(12);
    expect(result && formatResult(result)).toBe("12개");
    expect(result && durationMs(result)).toBe(40_000);
    expect(better).toBe("higher");
    expect(formatValue(null)).toBe("-");
  });

  it("틀린 칸으로 일찍 끝나도 찾은 개수가 결과다", () => {
    expect(parseResult({ found: 0, elapsedMs: 800 })).toEqual({ found: 0, elapsedMs: 800 });
  });

  it("불가능한 결과와 값은 거부한다", () => {
    expect(parseResult({ found: 12, elapsedMs: 1000 })).toBeNull();
    expect(parseResult({ found: -1, elapsedMs: 5000 })).toBeNull();
    expect(parseResult({ found: 1.5, elapsedMs: 5000 })).toBeNull();
    // 단계마다 15초라 3개를 찾고 끝났다면 4단계까지 최대 60초다.
    expect(parseResult({ found: 3, elapsedMs: 4 * LEVEL_TIME_MS })).not.toBeNull();
    expect(parseResult({ found: 3, elapsedMs: 4 * LEVEL_TIME_MS + 1 })).toBeNull();
    expect(parseResult({ found: 3 })).toBeNull();
    expect(isValidValue(0)).toBe(true);
    expect(isValidValue(MAX_FOUND)).toBe(true);
    expect(isValidValue(MAX_FOUND + 1)).toBe(false);
  });
});
