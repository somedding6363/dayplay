import { describe, expect, it } from "vitest";
import { distributionBucket } from "./distribution";

const labels: [string, string] = ["빠름", "느림"];
const distribution = { min: 100, max: 600, bins: 10, labels };

describe("distributionBucket", () => {
  it("구간 폭으로 나눈 칸에 넣는다", () => {
    expect(distributionBucket(100, distribution)).toBe(0);
    expect(distributionBucket(149, distribution)).toBe(0);
    expect(distributionBucket(150, distribution)).toBe(1);
    expect(distributionBucket(599, distribution)).toBe(9);
  });

  it("범위를 벗어나면 양 끝 칸에 넣는다", () => {
    expect(distributionBucket(1, distribution)).toBe(0);
    expect(distributionBucket(600, distribution)).toBe(9);
    expect(distributionBucket(9000, distribution)).toBe(9);
  });

  it("무효는 분포에 넣지 않는다", () => {
    expect(distributionBucket(null, distribution)).toBeUndefined();
  });
});
