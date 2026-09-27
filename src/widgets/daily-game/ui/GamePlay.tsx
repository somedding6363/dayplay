"use client";

import { useEffect, useRef, useState } from "react";
import { GameBoard } from "@/entities/game";
import { finishPlay, startPlay } from "../api/play-actions";
import type { PlayableGame } from "../model/games";
import { saveMessage, type SaveState } from "../model/save-message";

type Phase = "ready" | "playing" | "finished";

const inputs = ["click", "touch", "space"];

// 게임 흐름(ready → playing → finished)과 play 토큰 발급, 결과 저장을 맡는다.
export function GamePlay({ game }: { game: PlayableGame }) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [resultText, setResultText] = useState("");
  const [save, setSave] = useState<SaveState | null>(null);
  const boardRef = useRef<HTMLButtonElement>(null);
  const token = useRef<Promise<string | null>>(Promise.resolve(null));
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
    token.current = startPlay(game.gameId).catch(() => null);
    setSave(null);
    setPhase("playing");
  };

  const finish = async (result: unknown) => {
    const current = playNumber.current;
    setResultText(game.format(result));
    setPhase("finished");
    setSave({ status: "saving" });

    const playToken = await token.current;
    const next: SaveState = playToken
      ? await finishPlay(game.gameId, playToken, result).catch(() => ({
          status: "failed" as const,
        }))
      : { status: "failed" };
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
      <p role="status" className="min-h-5 text-caption text-muted">
        {save ? saveMessage(save, game.format) : null}
      </p>
    </div>
  );
}
