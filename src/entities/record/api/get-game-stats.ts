import "server-only";
import { sql } from "drizzle-orm";
import type { GameRules } from "@/entities/game";
import { db } from "@/shared/api";

export interface RankedRecord {
  // 같은 값은 같은 순위, 다음 순위는 앞선 사람 수만큼 건너뛴다(competition ranking).
  rank: number;
  nickname: string;
  value: number | null;
}

export interface GameStats {
  top: RankedRecord[];
  // 로그인했고 기록이 있을 때만 있다. percent는 상위 비율(0~100].
  me?: { rank: number; percent: number; value: number | null };
  // distribution.bins개 구간의 참가자 수. 무효(null)만 있는 참가자는 세지 않는다.
  buckets: number[];
  // 모든 날짜를 통틀은 참가자 수와 오늘 참가자 수.
  totalCount: number;
  todayCount: number;
}

const TOP_COUNT = 3;

function toNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function toValue(value: unknown) {
  return value === null ? null : toNumber(value);
}

// 게임 하나의 순위와 분포. 사용자마다 모든 날짜의 내 기록 중 최고 기록 하나로 센다(ARCHITECTURE 7장).
// 네 조회를 batch 한 번으로 보낸다.
export async function getGameStats(
  gameId: string,
  rules: Pick<GameRules<unknown>, "better" | "distribution">,
  today: string,
  userId?: string,
): Promise<GameStats> {
  const order = sql.raw(rules.better === "lower" ? "asc" : "desc");
  const { min, max, bins } = rules.distribution;
  const ranked = sql`
    with bests as (
      select distinct on (user_id) user_id, value, achieved_at, id
      from game_results
      where game_id = ${gameId}
      order by user_id, value ${order} nulls last, achieved_at, id
    ), ranked as (
      select *, rank() over (order by value ${order} nulls last) as rank from bests
    )`;

  const [top, me, buckets, counts] = await db.batch([
    db.execute(sql`${ranked}
      select ranked.rank, ranked.value, users.nickname
      from ranked join users on users.id = ranked.user_id
      order by ranked.rank, ranked.achieved_at, ranked.id
      limit ${TOP_COUNT}`),
    db.execute(sql`${ranked}
      select rank, value, (select count(*) from bests) as total
      from ranked where user_id = ${userId ?? null}`),
    db.execute(sql`${ranked}
      select least(greatest(width_bucket(value, ${min}, ${max}, ${bins}), 1), ${bins}) as bucket,
        count(*) as count
      from bests where value is not null group by bucket`),
    db.execute(sql`${ranked}
      select (select count(*) from bests) as total,
        (select count(*) from game_results where game_id = ${gameId} and date = ${today}) as today`),
  ]);

  const counted = Array.from({ length: bins }, () => 0);
  for (const row of buckets.rows) {
    const index = toNumber(row.bucket) - 1;
    if (index >= 0 && index < bins) {
      counted[index] = toNumber(row.count);
    }
  }
  const [mine] = me.rows;
  const [count] = counts.rows;

  return {
    top: top.rows.map((row) => ({
      rank: toNumber(row.rank),
      nickname: typeof row.nickname === "string" ? row.nickname : "이름 없음",
      value: toValue(row.value),
    })),
    me: mine
      ? {
          rank: toNumber(mine.rank),
          percent: (toNumber(mine.rank) / Math.max(toNumber(mine.total), 1)) * 100,
          value: toValue(mine.value),
        }
      : undefined,
    buckets: counted,
    totalCount: toNumber(count?.total),
    todayCount: toNumber(count?.today),
  };
}
