import { StatCard } from "@/shared/ui/stat-card";

export interface RankingEntry {
  rank: number;
  nickname: string;
  // 게임 규칙의 formatValue로 만든 표시 값. 예: "187ms"
  record: string;
}

interface GameRankingProps {
  entries: RankingEntry[];
  // 로그인했고 기록이 있을 때만 있다. percent는 상위 비율(0~100].
  me?: { rank: number; percent: number };
}

function formatPercent(percent: number) {
  return `${Math.max(Math.round(percent * 10) / 10, 0.1)}%`;
}

export function GameRanking({ entries, me }: GameRankingProps) {
  return (
    <StatCard title="게임 순위" meta={entries.length > 0 ? `top ${entries.length}` : undefined}>
      {entries.length === 0 ? (
        <p className="text-caption text-muted">아직 기록이 없어요.</p>
      ) : (
        <ol className="flex flex-col border-t border-hairline">
          {entries.map((entry, index) => (
            <li
              key={index}
              className="flex items-center gap-4 border-b border-hairline py-4 text-caption"
            >
              <span className="w-4 text-muted tabular-nums">{entry.rank}</span>
              <span className="flex-1 break-all">{entry.nickname}</span>
              <span className="text-caption-strong tabular-nums">{entry.record}</span>
            </li>
          ))}
        </ol>
      )}
      {me ? (
        <p className="text-caption text-muted">
          내 순위 <strong className="text-caption-strong text-ink">{me.rank}위</strong> · 상위{" "}
          {formatPercent(me.percent)}
        </p>
      ) : null}
    </StatCard>
  );
}
