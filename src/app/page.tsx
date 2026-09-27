import { connection } from "next/server";
import { dailySchedule, getDailyGames } from "@/entities/daily-game";
import { distributionBucket } from "@/entities/game";
import { getBestValues, getGameStats } from "@/entities/record/server";
import { auth } from "@/features/auth/server";
import { dateKeyToKstDate, formatKstDate, formatKstTime, todayKey } from "@/shared/lib";
import { PageContainer } from "@/shared/ui/page-container";
import { DailyGame, playableGames } from "@/widgets/daily-game";
import { GameRanking, ParticipantDistribution, TodayParticipants } from "@/widgets/game-stats";

export default async function Home() {
  await connection();
  const today = todayKey();
  const session = await auth();
  const userId = session?.user.id;
  // 일정에 있어도 아직 구현하지 않은 게임은 보여주지 않는다.
  const playable = getDailyGames(dailySchedule, today).flatMap(({ gameId }) => {
    const game = playableGames.get(gameId);
    return game ? [game] : [];
  });

  const [bests, stats] = await Promise.all([
    userId
      ? getBestValues(
          userId,
          Object.fromEntries(playable.map((game) => [game.gameId, game.better])),
        )
      : {},
    Promise.all(playable.map((game) => getGameStats(game.gameId, game, today, userId))),
  ]);
  const updatedAt = formatKstTime(new Date());

  return (
    <PageContainer className="flex-1 pt-6 pb-16">
      <main>
        <DailyGame
          // client로 넘기므로 컴포넌트와 함수는 빼고 표시 정보만 담는다.
          games={playable.map(({ gameId, name, instruction, color }) => ({
            gameId,
            name,
            instruction,
            color,
          }))}
          date={formatKstDate(dateKeyToKstDate(today))}
          today={today}
          signedIn={Boolean(session)}
          bests={bests}
          asides={Object.fromEntries(
            playable.map((game, index) => {
              const { top, me, buckets, totalCount, todayCount } = stats[index];
              return [
                game.gameId,
                <>
                  <GameRanking
                    entries={top.map(({ rank, nickname, value }) => ({
                      rank,
                      nickname,
                      record: game.formatValue(value),
                    }))}
                    me={me}
                  />
                  <ParticipantDistribution
                    buckets={buckets}
                    myBucket={me ? distributionBucket(me.value, game.distribution) : undefined}
                    rangeLabels={game.distribution.labels}
                  />
                  <TodayParticipants
                    count={todayCount}
                    totalCount={totalCount}
                    updatedAt={updatedAt}
                  />
                </>,
              ];
            }),
          )}
        />
      </main>
    </PageContainer>
  );
}
