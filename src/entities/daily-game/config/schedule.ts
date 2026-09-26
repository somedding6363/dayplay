import type { Schedule } from "../model/types";

// 공개 전까지는 시작일을 바꿀 수 있다. 공개 후에는 기존 항목을 고치지 말고 미래 날짜의 새 항목을 추가한다.
export const dailySchedule: Schedule = {
  week: [
    {
      from: "2026-09-21",
      games: { mon: ["reaction-time"], tue: ["ten-seconds"], thu: ["odd-color"] },
    },
  ],
  cycle: [
    {
      from: "2026-09-21",
      games: ["typing-sprint", "fake-letter", "stair-climb", "coin-flip", "racing"],
    },
  ],
};
