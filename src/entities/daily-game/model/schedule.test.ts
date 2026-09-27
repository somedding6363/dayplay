import { describe, expect, it } from "vitest";
import { addDays } from "@/shared/lib";
import { dailySchedule } from "../config/schedule";
import { getDailyGames } from "./schedule";
import type { Schedule } from "./types";

const start = dailySchedule.cycle[0].from;
const activeCycle = (day: string) => dailySchedule.cycle.findLast((entry) => entry.from <= day);
const days = Array.from({ length: 730 }, (_, index) => addDays(start, index));

describe("dailySchedule", () => {
  it("항목은 from 순서대로 추가한다", () => {
    for (const entries of [dailySchedule.week, dailySchedule.cycle]) {
      const froms = entries.map((entry) => entry.from);
      expect(froms).toEqual([...froms].sort());
    }
  });

  it("week 목록과 cycle 목록에 같은 게임이 없어 하루에 같은 게임이 두 번 열리지 않는다", () => {
    for (const day of days) {
      const ids = getDailyGames(dailySchedule, day).map((game) => game.gameId);
      expect(new Set(ids).size, day).toBe(ids.length);
    }
  });

  it("매일 cycle game이 하나 열리고, 목록에 게임이 둘 이상이면 같은 게임이 이틀 연속 나오지 않는다", () => {
    let previous: string | undefined;
    for (const day of days) {
      const cycle = getDailyGames(dailySchedule, day).filter((game) => game.kind === "cycle");
      expect(cycle, day).toHaveLength(1);
      if ((activeCycle(day)?.games.length ?? 0) > 1) {
        expect(cycle[0].gameId, day).not.toBe(previous);
      }
      previous = cycle[0].gameId;
    }
  });

  // 공개된 날짜의 결과가 바뀌면 이 테스트가 깨진다. 공개 후에는 기대값을 고치지 말고 일정 변경을 되돌린다.
  // 공개 전(서비스 시작일 미정)이라 2026-09-27에 cycle을 반응속도 → 10초 맞추기 → 다른 색상 찾기로 다시 정했다.
  it("이미 정한 날짜의 게임은 바뀌지 않는다", () => {
    const expected: Record<string, string> = {
      "2026-09-21": "reaction-time",
      "2026-09-22": "ten-seconds",
      "2026-09-23": "odd-color",
      "2026-09-27": "reaction-time",
      "2026-09-28": "ten-seconds",
    };
    for (const [day, gameId] of Object.entries(expected)) {
      expect(getDailyGames(dailySchedule, day), day).toEqual([{ gameId, kind: "cycle" }]);
    }
  });
});

describe("getDailyGames", () => {
  const schedule: Schedule = {
    week: [
      { from: "2026-01-05", games: { mon: ["a", "h"], wed: ["c"] } },
      { from: "2026-01-19", games: { mon: ["a"], fri: ["h"] } },
    ],
    cycle: [
      { from: "2026-01-05", games: ["x", "y", "z"] },
      { from: "2026-01-08", games: ["z", "w"] },
    ],
  };

  it("시작일 전에는 게임이 없다", () => {
    expect(getDailyGames(schedule, "2026-01-04")).toEqual([]);
  });

  it("week game은 요일마다 여러 개가 열리고, 없는 요일에는 cycle game만 열린다", () => {
    expect(getDailyGames(schedule, "2026-01-05").map((game) => game.gameId)).toEqual([
      "a",
      "h",
      "x",
    ]);
    expect(getDailyGames(schedule, "2026-01-06").map((game) => game.gameId)).toEqual(["y"]);
  });

  it("새 항목은 from 날짜부터 적용되고 이전 날짜는 그대로다", () => {
    expect(getDailyGames(schedule, "2026-01-07").map((game) => game.gameId)).toEqual(["c", "z"]);
    expect(getDailyGames(schedule, "2026-01-08").map((game) => game.gameId)).toEqual(["z"]);
    expect(getDailyGames(schedule, "2026-01-23").map((game) => game.gameId)).toContain("h");
  });
});
