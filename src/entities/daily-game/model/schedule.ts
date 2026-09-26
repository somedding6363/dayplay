import { daysBetween, weekdayOf } from "@/shared/lib";
import type { Schedule, ScheduledGame, Weekday } from "./types";

const weekdays: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function activeEntry<T extends { from: string }>(entries: T[], dateKey: string) {
  return entries.findLast((entry) => entry.from <= dateKey);
}

// 날짜만으로 그날의 게임이 정해진다. 적용 중인 항목이 없으면(시작일 전) 게임이 없다.
export function getDailyGames(schedule: Schedule, dateKey: string): ScheduledGame[] {
  const games: ScheduledGame[] = [];

  const week = activeEntry(schedule.week, dateKey);
  for (const gameId of week?.games[weekdays[weekdayOf(dateKey)]] ?? []) {
    games.push({ gameId, kind: "week" });
  }

  const cycle = activeEntry(schedule.cycle, dateKey);
  if (cycle && cycle.games.length > 0) {
    const index = daysBetween(cycle.from, dateKey) % cycle.games.length;
    games.push({ gameId: cycle.games[index], kind: "cycle" });
  }

  return games;
}
