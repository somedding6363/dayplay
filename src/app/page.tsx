import { connection } from "next/server";
import { dailySchedule, getDailyGames } from "@/entities/daily-game";
import { getBestValues } from "@/entities/record/server";
import { auth } from "@/features/auth/server";
import { dateKeyToKstDate, formatKstDate, todayKey } from "@/shared/lib";
import { PageContainer } from "@/shared/ui/page-container";
import { DailyGame, playableGames, type TodayGame } from "@/widgets/daily-game";
import { GameRanking, ParticipantDistribution, TodayParticipants } from "@/widgets/game-stats";
import { mockGameMeta } from "./mock-game-meta";
import { emptyGameStats, mockGameStats } from "./mock-game-stats";

export default async function Home() {
  await connection();
  const today = todayKey();
  const session = await auth();
  const directions = Object.fromEntries(
    [...playableGames.values()].map((game) => [game.gameId, game.better]),
  );
  const bests = session ? await getBestValues(session.user.id, directions) : {};

  const games: TodayGame[] = getDailyGames(dailySchedule, today).flatMap(({ gameId }) => {
    const meta = playableGames.get(gameId) ?? mockGameMeta[gameId];
    // client로 넘기므로 컴포넌트와 함수는 빼고 표시 정보만 담는다.
    return meta
      ? [{ gameId, name: meta.name, instruction: meta.instruction, color: meta.color }]
      : [];
  });

  return (
    <PageContainer className="flex-1 pt-6 pb-16">
      <main>
        <DailyGame
          games={games}
          date={formatKstDate(dateKeyToKstDate(today))}
          today={today}
          signedIn={Boolean(session)}
          bests={bests}
          asides={Object.fromEntries(
            games.map(({ gameId }) => {
              const stats = mockGameStats[gameId] ?? emptyGameStats;
              return [
                gameId,
                <>
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
