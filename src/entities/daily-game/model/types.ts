export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type GameKind = "week" | "cycle";

export interface WeekEntry {
  from: string;
  // 적지 않은 요일은 week game이 없다.
  games: Partial<Record<Weekday, string[]>>;
}

export interface CycleEntry {
  from: string;
  games: string[];
}

// 항목은 추가만 한다. 새 항목의 from은 공개되지 않은 미래 날짜여야 지난 날짜의 게임이 바뀌지 않는다.
export interface Schedule {
  week: WeekEntry[];
  cycle: CycleEntry[];
}

export interface ScheduledGame {
  gameId: string;
  kind: GameKind;
}
