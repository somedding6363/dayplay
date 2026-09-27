import { describe, expect, it } from "vitest";
import { isBetterScore } from "./best";

describe("isBetterScore", () => {
  it("높은 점수가 이기고 같으면 이기지 않는다", () => {
    expect(isBetterScore(-100, -200)).toBe(true);
    expect(isBetterScore(-200, -100)).toBe(false);
    expect(isBetterScore(-100, -100)).toBe(false);
  });

  it("점수가 있는 기록이 무효를 이기고, 무효는 아무것도 이기지 않는다", () => {
    expect(isBetterScore(-9999, null)).toBe(true);
    expect(isBetterScore(null, -9999)).toBe(false);
    expect(isBetterScore(null, null)).toBe(false);
  });
});
