"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GamePanel } from "@/entities/game";
import { recordLocalPlay } from "@/entities/record";
import { SignInButton } from "@/features/auth";
import { Button } from "@/shared/ui/button";
import { finishPlay, startPlay, type StartedPlay } from "../api/play-actions";
import type { BestResult } from "../model/best";
import type { PlayableGame } from "../model/games";

type Phase = "ready" | "playing" | "finished";

interface GamePlayProps {
  game: PlayableGame;
  signedIn: boolean;
  // 토큰 발급에 실패해 날짜를 모를 때 비로그인 기록에 쓴다.
  today: string;
  // 끝낸 play마다 부른다. 옆 영역의 내 최고 기록을 바로 갱신한다.
  onRecord: (record: BestResult) => void;
}

// 게임 흐름(ready → playing → finished)과 play 토큰 발급, 결과 저장을 맡는다.
// 로그인했으면 계정에, 아니면 이 브라우저에 저장한다.
export function GamePlay({ game, signedIn, today, onRecord }: GamePlayProps) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [resultText, setResultText] = useState("");
  // 로그인하지 않아 이 브라우저에 저장했으면 로그인 버튼을 보여준다.
  const [savedLocally, setSavedLocally] = useState(false);
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const started = useRef<Promise<StartedPlay | null>>(Promise.resolve(null));
  // play를 다시 시작하면 이전 play의 저장 응답은 버린다.
  const playNumber = useRef(0);
  // 결과를 읽을 수 있도록 결과 판에 focus를 둔다. 다시 하기 버튼에 두면, 게임이 끝나는 순간에도
  // 계속 누르던 Space·Enter가 바로 다시 시작해 버린다.
  useEffect(() => {
    if (phase === "finished") {
      panelRef.current?.focus();
    }
  }, [phase]);

  const start = () => {
    playNumber.current += 1;
    started.current = startPlay(game.gameId).catch(() => null);
    setSavedLocally(false);
    setPhase("playing");
  };

  const finish = async (result: unknown) => {
    const current = playNumber.current;
    const value = game.value(result);
    setResultText(game.format(result));
    setPhase("finished");
    onRecord({ value });

    const play = await started.current;
    const saveLocal = () =>
      recordLocalPlay(
        {
          date: play?.date ?? today,
          gameId: game.gameId,
          value,
          playToken: play?.playToken ?? null,
          playedAt: new Date().toISOString(),
        },
        game.better,
      );

    if (!signedIn) {
      saveLocal();
      if (current === playNumber.current) {
        setSavedLocally(true);
      }
      return;
    }

    const saved = play
      ? await finishPlay(game.gameId, play.playToken, result).catch(() => null)
      : null;
    if (saved?.status === "saved") {
      // 순위와 분포는 서버가 그린다. 내 기록이 바뀌었을 때만 다시 읽는다.
      if (saved.improved) {
        router.refresh();
      }
      return;
    }
    // 세션 만료, 토큰 발급 실패, 토큰 거부, 네트워크 오류로 저장하지 못하면 결과를 잃지 않도록 브라우저에 남긴다.
    // 오늘 다시 들어오면 로그인 직후 병합으로 다시 저장한다. 토큰이 없거나 날짜가 지나면 이 기기에만 남는다.
    saveLocal();
    if (saved?.status === "signed-out" && current === playNumber.current) {
      setSavedLocally(true);
    }
  };

  if (phase === "playing") {
    return <game.Component onFinish={finish} />;
  }

  const finished = phase === "finished";

  return (
    <div className="flex flex-col gap-3">
      {/* 판은 보여주기만 하고, 시작은 판 아래쪽 버튼으로만 한다.
          게임이 끝나는 순간에도 판을 계속 누르던 입력이 다시 시작으로 이어지지 않는다. */}
      <GamePanel
        ref={panelRef}
        tabIndex={-1}
        aria-live="polite"
        label={finished ? resultText : game.name}
        description={finished ? undefined : game.instruction}
        art={<game.Thumbnail />}
        action={
          <Button type="button" onClick={start}>
            {finished ? "다시 하기" : "시작"}
          </Button>
        }
        className="outline-none"
      />
      {savedLocally ? (
        <div className="flex justify-end">
          <SignInButton label="로그인하고 기록 저장" size="sm" />
        </div>
      ) : null}
    </div>
  );
}
