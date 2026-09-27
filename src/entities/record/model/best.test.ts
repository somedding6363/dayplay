import { describe, expect, it } from "vitest";
import { isBetterValue } from "./best";

describe("isBetterValue", () => {
  it("작을수록 좋은 게임은 작은 값이 이기고, 같으면 이기지 않는다", () => {
    expect(isBetterValue(180, 200, "lower")).toBe(true);
    expect(isBetterValue(200, 180, "lower")).toBe(false);
    expect(isBetterValue(180, 180, "lower")).toBe(false);
  });

  it("클수록 좋은 게임은 큰 값이 이긴다", () => {
    expect(isBetterValue(42, 30, "higher")).toBe(true);
    expect(isBetterValue(30, 42, "higher")).toBe(false);
  });

  it("값이 있는 결과가 무효를 이기고, 무효는 아무것도 이기지 않는다", () => {
    expect(isBetterValue(9999, null, "lower")).toBe(true);
    expect(isBetterValue(null, 9999, "lower")).toBe(false);
    expect(isBetterValue(null, null, "higher")).toBe(false);
  });
});
