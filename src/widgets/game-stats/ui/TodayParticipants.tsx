import { StatCard } from "@/shared/ui/stat-card";

interface TodayParticipantsProps {
  count: number;
  totalCount: number;
  updatedAt: string;
}

export function TodayParticipants({ count, totalCount, updatedAt }: TodayParticipantsProps) {
  return (
    <StatCard title="오늘 참가자" meta={`KST ${updatedAt}`}>
      <p className="text-display-lg">{count.toLocaleString("ko-KR")}</p>
      <p className="flex justify-between border-t border-hairline pt-4 text-caption">
        <span className="text-muted">누적 참가자</span>
        <span className="text-caption-strong">{totalCount.toLocaleString("ko-KR")}명</span>
      </p>
    </StatCard>
  );
}
