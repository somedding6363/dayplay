import { cx } from "@/shared/lib";
import { StatCard } from "@/shared/ui/stat-card";

export interface DistributionBar {
  count: number;
  // 구간이 덮는 값. 예: "150ms ~ 200ms", "600ms 이상"
  label: string;
}

interface ParticipantDistributionProps {
  // 왼쪽이 좋은 기록 쪽이다.
  bars: DistributionBar[];
  myBucket?: number;
}

export function ParticipantDistribution({ bars, myBucket }: ParticipantDistributionProps) {
  const max = Math.max(...bars.map((bar) => bar.count), 0);

  if (max === 0) {
    return (
      <StatCard title="참가자 분포">
        <p className="text-caption text-muted">아직 기록이 없어요.</p>
      </StatCard>
    );
  }

  return (
    <StatCard title="참가자 분포">
      {/* 구간 값과 인원은 막대에 hover하거나 focus(tap)했을 때 위에 겹쳐 보여준다. */}
      <ol
        aria-label="참가자 기록 분포. 왼쪽이 좋은 기록"
        className="flex h-32 items-end gap-1.5 pt-4"
      >
        {bars.map((bar, index) => {
          const mine = index === myBucket;
          const text = `${bar.label} · ${bar.count.toLocaleString("ko-KR")}명`;
          return (
            <li
              key={index}
              tabIndex={0}
              // 화면에서는 색과 점으로 내 막대를 구분하고, 화면 낭독기에는 말로 알린다.
              aria-label={mine ? `${text}, 내 기록` : text}
              style={{ height: `${Math.max((bar.count / max) * 100, 8)}%` }}
              className={cx(
                "group relative flex-1 outline-none focus-visible:ring-2 focus-visible:ring-ink",
                mine ? "bg-game" : "bg-hairline",
              )}
            >
              {mine ? (
                <span
                  aria-hidden="true"
                  className="absolute -top-3 left-1/2 size-2 -translate-x-1/2 rounded-full bg-game"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={cx(
                  "pointer-events-none absolute bottom-full z-10 mb-2 hidden rounded-xs bg-ink px-2 py-1 text-fine-print whitespace-nowrap text-on-primary group-hover:block group-focus:block",
                  // 카드 밖으로 넘치지 않도록 앞쪽 막대는 왼쪽, 뒤쪽 막대는 오른쪽에 맞춘다.
                  index < bars.length / 2 ? "left-0" : "right-0",
                )}
              >
                {text}
              </span>
            </li>
          );
        })}
      </ol>
    </StatCard>
  );
}
