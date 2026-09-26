import type { RankingEntry } from "@/widgets/game-stats";

// 기록 저장과 집계가 생기기 전까지 화면 틀을 잡기 위한 mock 데이터다.

interface MockGameStats {
  myBest?: string;
  ranking: RankingEntry[];
  myRank?: number;
  buckets: number[];
  rangeLabels: [start: string, end: string];
  myBucket?: number;
  participants: { count: number; totalCount: number; updatedAt: string };
}

export const emptyGameStats: MockGameStats = {
  ranking: [],
  buckets: [],
  rangeLabels: ["", ""],
  participants: { count: 0, totalCount: 0, updatedAt: "11:48" },
};

export const mockGameStats: Record<string, MockGameStats> = {
  "reaction-time": {
    myBest: "168ms",
    ranking: [
      { rank: 1, nickname: "새벽세시", score: "118ms" },
      { rank: 2, nickname: "우유한잔", score: "124ms" },
      { rank: 3, nickname: "초록양말", score: "131ms" },
    ],
    myRank: 1832,
    buckets: [4, 9, 16, 24, 30, 22, 14, 7],
    rangeLabels: ["빠름", "느림"],
    myBucket: 4,
    participants: { count: 1284, totalCount: 15320, updatedAt: "11:48" },
  },
  "ten-seconds": {
    ranking: [
      { rank: 1, nickname: "초록양말", score: "±0.00초" },
      { rank: 2, nickname: "모래시계", score: "±0.01초" },
      { rank: 3, nickname: "새벽세시", score: "±0.01초" },
    ],
    buckets: [3, 12, 26, 20, 14, 9, 5, 2],
    rangeLabels: ["정확", "벗어남"],
    participants: { count: 612, totalCount: 2104, updatedAt: "11:48" },
  },
};
