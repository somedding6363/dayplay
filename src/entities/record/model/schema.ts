import { date, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "@/entities/user";

// 사용자의 날짜·게임별 내 기록. 가장 좋은 play의 값과 시각, 시도 횟수만 남긴다.
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
    // 비교·정렬에 쓰는 결과 값(ms 등). 좋은 방향은 게임 규칙의 better다. 무효 결과는 null이고 순위에서 가장 뒤다.
    value: integer("value"),
    achievedAt: timestamp("achieved_at", { withTimezone: true, mode: "date" }).notNull(),
    // 그날 이 게임을 끝낸 play 수. 무효도 센다. 더 낮은 play는 남기지 않고 횟수만 늘린다.
    attempts: integer("attempts").notNull().default(1),
  },
  (result) => [
    uniqueIndex("game_results_user_date_game_unique").on(result.userId, result.date, result.gameId),
  ],
);
