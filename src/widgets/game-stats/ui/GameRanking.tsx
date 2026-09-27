import { StatCard } from "@/shared/ui/stat-card";

export interface RankingEntry {
  rank: number;
  nickname: string;
  score: string;
}

interface GameRankingProps {
  entries: RankingEntry[];
  myRank?: number;
}

export function GameRanking({ entries, myRank }: GameRankingProps) {
  return (
    <StatCard title="게임 순위" meta={entries.length > 0 ? `top ${entries.length}` : undefined}>
      {entries.length === 0 ? (
        <p className="text-caption text-muted">아직 기록이 없어요.</p>
      ) : (
        <ol className="flex flex-col border-t border-hairline">
          {entries.map((entry) => (
            <li
              key={entry.rank}
              className="flex items-center gap-4 border-b border-hairline py-4 text-caption"
            >
              <span className="w-4 text-muted">{entry.rank}</span>
              <span className="flex-1">{entry.nickname}</span>
              <span className="text-caption-strong">{entry.score}</span>
            </li>
          ))}
        </ol>
      )}
      {myRank ? (
        <p className="text-caption text-muted">
          기록을 저장하면 현재 <strong className="text-caption-strong text-ink">{myRank}위</strong>
          예요.
        </p>
      ) : null}
    </StatCard>
  );
}
