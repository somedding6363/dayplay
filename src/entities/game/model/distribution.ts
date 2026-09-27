import type { GameRules } from "./types";

type Distribution = GameRules<unknown>["distribution"];

// 값이 들어갈 분포 구간(0부터). 범위를 벗어난 값은 양 끝 칸에 넣는다. 무효(null)는 분포에 넣지 않는다.
// 서버 집계(width_bucket)와 같은 기준이다.
export function distributionBucket(value: number | null, { min, max, bins }: Distribution) {
  if (value === null) {
    return undefined;
  }
  const index = Math.floor(((value - min) / (max - min)) * bins);
  return Math.min(Math.max(index, 0), bins - 1);
}

// 구간이 덮는 값의 범위. 첫 칸은 from이, 마지막 칸은 to가 없다(범위 밖 값을 함께 담는다).
export function distributionBucketRange(index: number, { min, max, bins }: Distribution) {
  const width = (max - min) / bins;
  return {
    from: index === 0 ? undefined : min + index * width,
    to: index === bins - 1 ? undefined : min + (index + 1) * width,
  };
}
