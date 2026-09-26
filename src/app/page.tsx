import { connection } from "next/server";
import { formatKstDate } from "@/shared/lib";
import { PageContainer } from "@/shared/ui/page-container";
import { DailyGame } from "@/widgets/daily-game";
import { SiteFooter } from "@/widgets/site-footer";
import { SiteHeader } from "@/widgets/site-header";
import {
  GameRanking,
  MyBest,
  ParticipantDistribution,
  TodayParticipants,
} from "@/widgets/game-stats";
import { mockTodayGames } from "./mock-today-games";
import { mockGameStats } from "./mock-game-stats";

export default async function Home() {
  await connection();
  const today = formatKstDate(new Date());

  return (
    <>
      <SiteHeader />
      <PageContainer className="flex-1 pt-6 pb-16">
        <main>
          <DailyGame
            games={mockTodayGames}
            date={today}
            asides={Object.fromEntries(
              mockTodayGames.map(({ gameId }) => {
                const stats = mockGameStats[gameId];
                return [
                  gameId,
                  stats ? (
                    <>
                      <MyBest best={stats.myBest} />
                      <GameRanking entries={stats.ranking} myRank={stats.myRank} />
                      <ParticipantDistribution
                        buckets={stats.buckets}
                        myBucket={stats.myBucket}
                        rangeLabels={stats.rangeLabels}
                      />
                      <TodayParticipants {...stats.participants} />
                    </>
                  ) : null,
                ];
              }),
            )}
          />
        </main>
      </PageContainer>
      <SiteFooter />
    </>
  );
}
