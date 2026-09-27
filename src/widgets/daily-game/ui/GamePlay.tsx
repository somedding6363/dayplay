"use client";

import { useEffect, useRef, useState } from "react";
import { GameBoard } from "@/entities/game";
import { recordLocalPlay } from "@/entities/record";
import { SignInButton } from "@/features/auth";
import { finishPlay, startPlay, type StartedPlay } from "../api/play-actions";
import type { BestResult } from "../model/best";
import type { PlayableGame } from "../model/games";
import { saveMessage, type SaveState } from "../model/save-message";

type Phase = "ready" | "playing" | "finished";

const inputs = ["click", "touch", "space"];

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
  const [save, setSave] = useState<SaveState | null>(null);
  const boardRef = useRef<HTMLButtonElement>(null);
  const started = useRef<Promise<StartedPlay | null>>(Promise.resolve(null));
  // play를 다시 시작하면 이전 play의 저장 응답은 버린다.
  const playNumber = useRef(0);
  // play를 끝낸 입력의 click이 새로 그려진 결과 판에 떨어져 바로 다시 시작하지 않도록,
  // 이 판에서 누른 포인터 입력만 받는다. 키보드와 보조 기술의 click(detail 0)은 그대로 받는다.
  const pressedHere = useRef(false);

  useEffect(() => {
    if (phase === "finished") {
      boardRef.current?.focus();
    }
  }, [phase]);

  const start = () => {
    pressedHere.current = false;
    playNumber.current += 1;
    started.current = startPlay(game.gameId).catch(() => null);
    setSave(null);
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
        setSave({ status: "local" });
      }
      return;
    }

    setSave({ status: "saving" });
    let next: SaveState = { status: "failed" };
    if (play) {
      next = await finishPlay(game.gameId, play.playToken, result).catch(() => ({
        status: "failed" as const,
      }));
    }
    // 세션 만료, 토큰 거부, 네트워크 오류로 저장하지 못하면 결과를 잃지 않도록 브라우저에 남긴다.
    // 오늘 다시 들어오면 로그인 직후 병합과 같은 흐름으로 다시 저장한다. 토큰이 없거나 날짜가 지나면 이 기기에만 남는다.
    if (next.status === "signed-out") {
      saveLocal();
      next = { status: "local" };
    } else if (next.status === "rejected" || next.status === "failed") {
      saveLocal();
      next = { status: "retry-later" };
    }
    if (current === playNumber.current) {
      setSave(next);
    }
  };

  if (phase === "playing") {
    return <game.Component onFinish={finish} />;
  }

  const finished = phase === "finished";

  return (
    <div className="flex flex-col gap-3">
      <GameBoard
        ref={boardRef}
        label={finished ? resultText : "시작"}
        description={finished ? "다시 하려면 누르세요." : game.instruction}
        inputs={inputs}
        aria-label={
          finished
            ? `결과 ${resultText}. 다시 시작하려면 누르세요.`
            : `${game.name} 시작. 판을 누르거나 스페이스바를 누르세요.`
        }
        onPointerDown={() => {
          pressedHere.current = true;
        }}
        onClick={(event) => {
          if (event.detail === 0 || pressedHere.current) {
            start();
          }
        }}
      />
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p role="status" className="text-caption text-muted">
          {save ? saveMessage(save, game.formatValue) : null}
        </p>
        {save?.status === "local" ? <SignInButton label="로그인하고 기록 저장" size="sm" /> : null}
      </div>
    </div>
  );
}
