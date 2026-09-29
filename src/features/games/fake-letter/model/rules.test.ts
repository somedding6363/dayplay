import { describe, expect, it } from "vitest";
import { MAX_GRID_SIZE, gridSize, letterPairs, makePuzzle, tierOf } from "./letters";
import { LEVEL_TIME_MS, MAX_FOUND, fakeLetterRules } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, better } = fakeLetterRules;

describe("letters", () => {
  it("격자는 3×3에서 두 단계마다 한 줄씩 늘어 6×6에서 멈춘다", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 20].map(gridSize)).toEqual([3, 3, 4, 4, 5, 5, 6, 6]);
    expect(gridSize(100)).toBe(MAX_GRID_SIZE);
  });

  it("단계가 오를수록 더 비슷한 글자 묶음에서 고른다", () => {
    expect([1, 3, 4, 7, 8, 30].map(tierOf)).toEqual([0, 0, 1, 1, 2, 2]);
  });

  it("진짜와 가짜는 서로 다른 한 글자이고, 가짜 칸은 격자 안에 있다", () => {
    for (const tier of letterPairs) {
      for (const [a, b] of tier) {
        expect([...a]).toHaveLength(1);
        expect([...b]).toHaveLength(1);
        expect(a).not.toBe(b);
      }
    }
    for (const value of [0, 0.5, 0.999]) {
      const puzzle = makePuzzle(9, undefined, () => value);
      expect(puzzle.real).not.toBe(puzzle.fake);
      expect(puzzle.fakeIndex).toBeLessThan(gridSize(9) ** 2);
    }
  });
});

describe("puzzle order", () => {
  it("난이도마다 글자 묶음이 15개 이상이고, 한 난이도 안에서 글자가 겹치지 않는다", () => {
    for (const tier of letterPairs) {
      expect(tier.length).toBeGreaterThanOrEqual(15);
      const letters = tier.flat();
      expect(new Set(letters).size).toBe(letters.length);
    }
  });

  it("바로 앞 단계에 나온 글자는 다음 단계에 나오지 않는다", () => {
    let value = 0.37;
    const random = () => (value = (value * 9301 + 0.4927) % 1);
    let previous = makePuzzle(1, undefined, random);
    for (let level = 2; level < 200; level += 1) {
      const next = makePuzzle(level, previous, random);
      expect([next.real, next.fake]).not.toContain(previous.real);
      expect([next.real, next.fake]).not.toContain(previous.fake);
      previous = next;
    }
  });
});

describe("fakeLetterRules", () => {
  it("값은 찾은 개수이고 클수록 좋다", () => {
    const result = parseResult({ found: 12, elapsedMs: 40000 });
    expect(result && toValue(result)).toBe(12);
    expect(result && formatResult(result)).toBe("12개");
    expect(formatValue(null)).toBe("-");
    expect(better).toBe("higher");
  });

  it("받은 시간보다 오래 걸린 결과와 너무 빠른 결과는 거부한다", () => {
    expect(parseResult({ found: 0, elapsedMs: LEVEL_TIME_MS })).not.toBeNull();
    expect(parseResult({ found: 0, elapsedMs: LEVEL_TIME_MS + 1 })).toBeNull();
    expect(parseResult({ found: 10, elapsedMs: 1499 })).toBeNull();
    expect(parseResult({ found: 10, elapsedMs: 1500 })).not.toBeNull();
    expect(parseResult({ found: 1.5, elapsedMs: 3000 })).toBeNull();
    expect(parseResult({ found: 3 })).toBeNull();
    expect(isValidValue(MAX_FOUND)).toBe(true);
    expect(isValidValue(MAX_FOUND + 1)).toBe(false);
  });
});
