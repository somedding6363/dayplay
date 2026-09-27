import { isBetterScore, type LocalRecord } from "@/entities/record";

export interface BestResult {
  rawResult: unknown;
  score: number | null;
}

export function pickBest(...candidates: (BestResult | undefined)[]) {
  return candidates.reduce<BestResult | undefined>(
    (best, next) => (next && (!best || isBetterScore(next.score, best.score)) ? next : best),
    undefined,
  );
}

// 비로그인 사용자의 모든 날짜를 통틀은 최고 기록.
export function bestOfLocal(records: LocalRecord[], gameId: string) {
  return pickBest(...records.filter((record) => record.gameId === gameId));
}
