import type { Better } from "@/entities/game";
import { isBetterValue, type LocalRecord } from "@/entities/record";

// 기록이 없으면 undefined, 무효 기록만 있으면 value가 null이다.
export interface BestResult {
  value: number | null;
}

export function pickBest(better: Better, ...candidates: (BestResult | undefined)[]) {
  return candidates.reduce<BestResult | undefined>(
    (best, next) =>
      next && (!best || isBetterValue(next.value, best.value, better)) ? next : best,
    undefined,
  );
}

// 비로그인 사용자의 모든 날짜를 통틀은 최고 기록.
export function bestOfLocal(records: LocalRecord[], gameId: string, better: Better) {
  return pickBest(better, ...records.filter((record) => record.gameId === gameId));
}
