import { connection } from "next/server";
import { dailySchedule, getDailyGames } from "@/entities/daily-game";
import { dateKeyToKstDate, formatKstDate, toKstDateKey } from "@/shared/lib";
import { PageContainer } from "@/shared/ui/page-container";
import { DailyGame, type TodayGame } from "@/widgets/daily-game";
import {
  GameRanking,
  MyBest,
  ParticipantDistribution,
  TodayParticipants,
} from "@/widgets/game-stats";
import { mockGameMeta } from "./mock-game-meta";
import { emptyGameStats, mockGameStats } from "./mock-game-stats";

// E2E처럼 날짜를 고정해야 할 때만 DAYPLAY_TODAY(YYYY-MM-DD)를 쓴다. 형식이 틀리면 무시한다.
function todayKey() {
  const fixed = process.env.DAYPLAY_TODAY;
  return fixed && /^\d{4}-\d{2}-\d{2}$/.test(fixed) ? fixed : toKstDateKey(new Date());
}

export default async function Home() {
  await connection();
  const today = todayKey();

  const games: TodayGame[] = getDailyGames(dailySchedule, today).flatMap(({ gameId }) => {
    const meta = mockGameMeta[gameId];
    return meta ? [{ gameId, ...meta }] : [];
  });

  return (
    <PageContainer className="flex-1 pt-6 pb-16">
      <main>
        <DailyGame
          games={games}
          date={formatKstDate(dateKeyToKstDate(today))}
          asides={Object.fromEntries(
            games.map(({ gameId }) => {
              const stats = mockGameStats[gameId] ?? emptyGameStats;
              return [
                gameId,
                <>
                  <MyBest best={stats.myBest} />
                  <GameRanking entries={stats.ranking} myRank={stats.myRank} />
                  <ParticipantDistribution
                    buckets={stats.buckets}
                    myBucket={stats.myBucket}
                    rangeLabels={stats.rangeLabels}
                  />
                  <TodayParticipants {...stats.participants} />
                </>,
              ];
            }),
          )}
        />
      </main>
    </PageContainer>
  );
}
