import type { GameRules } from "./types";

// 값이 들어갈 분포 구간(0부터). 범위를 벗어난 값은 양 끝 칸에 넣는다. 무효(null)는 분포에 넣지 않는다.
// 서버 집계(width_bucket)와 같은 기준이다.
export function distributionBucket(
  value: number | null,
  { min, max, bins }: GameRules<unknown>["distribution"],
) {
  if (value === null) {
    return undefined;
  }
  const index = Math.floor(((value - min) / (max - min)) * bins);
  return Math.min(Math.max(index, 0), bins - 1);
}
