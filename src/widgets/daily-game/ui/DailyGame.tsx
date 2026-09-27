"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import { GameBoard } from "@/entities/game";
import { readLocalRecords, readServerLocalRecords, subscribeLocalRecords } from "@/entities/record";
import { TabItem, Tabs } from "@/shared/ui/tabs";
import { bestOfLocal, pickBest, type BestResult } from "../model/best";
import { gameColorStyle } from "../model/game-color-style";
import { playableGames } from "../model/games";
import type { TodayGame } from "../model/types";
import { useLocalRecordSync } from "../model/use-local-record-sync";
import { useSelectedGame } from "../model/use-selected-game";
import { GamePlay } from "./GamePlay";
import { MyBestCard } from "./MyBestCard";

interface DailyGameProps {
  games: TodayGame[];
  date: string;
  // 판정 날짜(KST date key).
  today: string;
  signedIn: boolean;
  // 로그인 사용자의 게임별 모든 날짜 최고 기록.
  bests: Record<string, BestResult>;
  // server에서 게임마다 미리 그린 옆 영역. 선택한 게임의 것만 보여준다.
  asides: Record<string, ReactNode>;
}

const formatUnknown = () => "-";

// 옆 영역의 순위·분포도 선택한 게임 색을 따라야 해서 두 column을 같은 색 scope에 둔다.
// 게임 영역은 sticky라서 긴 옆 영역을 먼저 스크롤하고, grid 끝에 닿으면 함께 올라간다.
export function DailyGame({ games, date, today, signedIn, bests, asides }: DailyGameProps) {
  const { selected, select } = useSelectedGame(games);
  const playable = selected && playableGames.get(selected.gameId);
  const localRecords = useSyncExternalStore(
    subscribeLocalRecords,
    readLocalRecords,
    readServerLocalRecords,
  );
  // 이번 방문에서 끝낸 play. 서버 기록을 다시 읽지 않고 내 최고 기록을 바로 갱신한다.
  const [sessionBests, setSessionBests] = useState<Record<string, BestResult>>({});
  useLocalRecordSync(signedIn, today);

  if (!selected) {
    return <p className="text-body text-muted">오늘 열린 게임이 없어요.</p>;
  }

  return (
    <div
      style={gameColorStyle(selected)}
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8"
    >
      <section
        aria-label="오늘의 게임"
        className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6 lg:self-start"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-tagline">{date}</h1>
          <p className="text-caption text-muted">게임은 매일 바뀌어요.</p>
        </div>

        <Tabs label="오늘의 게임 목록">
          {games.map((game) => (
            <TabItem
              key={game.gameId}
              selected={game.gameId === selected.gameId}
              onClick={() => select(game.gameId)}
              accentClassName="bg-game"
            >
              {game.name}
            </TabItem>
          ))}
        </Tabs>

        {/* 게임을 바꾸면 흐름을 처음부터 시작한다. 아직 만들지 않은 게임은 시작 판만 보여준다. */}
        {playable ? (
          <GamePlay
            key={playable.gameId}
            game={playable}
            signedIn={signedIn}
            today={today}
            onRecord={(record) =>
              setSessionBests((current) => {
                const best = pickBest(current[playable.gameId], record);
                return best ? { ...current, [playable.gameId]: best } : current;
              })
            }
          />
        ) : (
          <GameBoard
            label="시작"
            description={selected.instruction}
            inputs={["click", "touch", "space"]}
            aria-label={`${selected.name} 시작. 판을 누르거나 스페이스바를 누르세요.`}
          />
        )}
      </section>

      <aside className="flex flex-col gap-4 lg:border-l lg:border-hairline-soft lg:pl-8">
        <MyBestCard
          best={
            signedIn
              ? pickBest(bests[selected.gameId], sessionBests[selected.gameId])
              : bestOfLocal(localRecords, selected.gameId)
          }
          format={playable?.format ?? formatUnknown}
          local={!signedIn}
        />
        {asides[selected.gameId]}
      </aside>
    </div>
  );
}
