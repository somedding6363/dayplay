import { StatCard } from "./StatCard";

interface MyBestProps {
  best?: string;
}

export function MyBest({ best }: MyBestProps) {
  return (
    <StatCard title="내 최고 기록">
      {best ? (
        <p className="text-display-lg">{best}</p>
      ) : (
        <p className="text-caption text-muted">게임을 끝내면 여기에 기록이 남아요.</p>
      )}
    </StatCard>
  );
}
