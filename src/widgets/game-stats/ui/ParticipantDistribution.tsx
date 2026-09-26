import { cx } from "@/shared/lib";
import { StatCard } from "./StatCard";

interface ParticipantDistributionProps {
  buckets: number[];
  myBucket?: number;
  // 왼쪽(첫 구간)과 오른쪽(마지막 구간) 끝이 뜻하는 말. 게임마다 다르다.
  rangeLabels: [start: string, end: string];
}

export function ParticipantDistribution({
  buckets,
  myBucket,
  rangeLabels,
}: ParticipantDistributionProps) {
  const max = Math.max(...buckets, 0);

  if (max === 0) {
    return (
      <StatCard title="참가자 분포">
        <p className="text-caption text-muted">아직 기록이 없어요.</p>
      </StatCard>
    );
  }

  const summary =
    myBucket === undefined
      ? "참가자 기록 분포"
      : `참가자 기록 분포. 내 기록은 ${rangeLabels[0]} 쪽에서 ${myBucket + 1}번째 구간`;

  return (
    <StatCard title="참가자 분포">
      <figure aria-label={summary} className="flex flex-col gap-3">
        <div aria-hidden="true" className="flex h-32 items-end gap-1.5 pt-4">
          {buckets.map((count, index) => {
            const mine = index === myBucket;
            return (
              <span
                key={index}
                style={{ height: `${Math.max((count / max) * 100, 8)}%` }}
                className={cx("relative flex-1", mine ? "bg-game" : "bg-hairline")}
              >
                {mine ? (
                  <span className="absolute -top-3 left-1/2 size-2 -translate-x-1/2 rounded-full bg-game" />
                ) : null}
              </span>
            );
          })}
        </div>
        <figcaption className="flex justify-between text-fine-print text-muted">
          <span>{rangeLabels[0]}</span>
          <span>{rangeLabels[1]}</span>
        </figcaption>
      </figure>
    </StatCard>
  );
}
