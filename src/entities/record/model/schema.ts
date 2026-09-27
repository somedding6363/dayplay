import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { users } from "@/entities/user";

// 사용자의 날짜·게임별 내 기록. play마다의 원본 결과는 두지 않고 가장 좋은 play 하나만 남긴다.
export const gameResults = pgTable(
  "game_results",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // daily_games 테이블 도입 전이라 (date, game_id)로 오늘의 게임을 가리킨다.
    date: date("date", { mode: "string" }).notNull(),
    gameId: text("game_id").notNull(),
    gameVersion: integer("game_version").notNull(),
    rawResult: jsonb("raw_result").notNull(),
    // 무효 결과는 null이다. 순위에서는 가장 뒤에 둔다.
    score: integer("score"),
    playId: text("play_id").notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (result) => [
    uniqueIndex("game_results_user_date_game_unique").on(result.userId, result.date, result.gameId),
  ],
);

// 끝낸 play 하나에 한 행. 시도 횟수를 세고, play_id 기본키로 같은 play 토큰을 한 번만 받는다.
export const plays = pgTable(
  "plays",
  {
    playId: text("play_id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: date("date", { mode: "string" }).notNull(),
    gameId: text("game_id").notNull(),
    // 무효 결과는 null이다. 같은 play의 재전송인지 판별할 때도 쓴다.
    score: integer("score"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (play) => [index("plays_user_date_game_idx").on(play.userId, play.date, play.gameId)],
);
