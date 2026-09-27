import { StatCard } from "@/shared/ui/stat-card";
import type { BestResult } from "../model/best";

interface MyBestCardProps {
  best: BestResult | undefined;
  format: (result: unknown) => string;
  // 비로그인 기록은 이 브라우저에만 있다.
  local: boolean;
}

export function MyBestCard({ best, format, local }: MyBestCardProps) {
  return (
    <StatCard title="내 최고 기록" meta={best && local ? "이 기기" : undefined}>
      {best ? (
        <p className="text-display-lg tabular-nums">{format(best.rawResult)}</p>
      ) : (
        <p className="text-caption text-muted">게임을 끝내면 여기에 기록이 남아요.</p>
      )}
    </StatCard>
  );
}
