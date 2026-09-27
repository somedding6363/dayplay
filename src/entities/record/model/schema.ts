import { date, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "@/entities/user";

// 사용자의 날짜·게임별 내 기록. 판마다의 결과는 두지 않고 가장 좋은 판 하나만 남긴다.
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
    score: integer("score").notNull(),
    playId: text("play_id").notNull(),
    achievedAt: timestamp("achieved_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (result) => [
    uniqueIndex("game_results_user_date_game_unique").on(result.userId, result.date, result.gameId),
  ],
);

// 저장한 판. play_id가 기본키라 같은 판 토큰은 한 번만 저장된다. 재전송 판별에 score를 남긴다.
export const resultRequests = pgTable("result_requests", {
  playId: text("play_id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
});
