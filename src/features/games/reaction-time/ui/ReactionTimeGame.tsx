"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { GameBoard, type GameProps } from "@/entities/game";
import {
  REACTION_TIMEOUT_MS,
  randomWaitMs,
  toReactionMs,
  type ReactionTimeResult,
} from "../model/rules";

type Phase = "waiting" | "signal";

// 시간은 모두 performance.now()와 같은 기준(event.timeStamp, requestAnimationFrame 인자)으로 잰다.
export function ReactionTimeGame({ onFinish }: GameProps<ReactionTimeResult>) {
  const [phase, setPhase] = useState<Phase>("waiting");
  const boardRef = useRef<HTMLButtonElement>(null);
  const startedAt = useRef(0);
  const signalAt = useRef<number | null>(null);
  const finished = useRef(false);

  const finish = (ms: number | null, at: number) => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    onFinish({ ms, elapsedMs: Math.max(0, Math.round(at - startedAt.current)) });
  };
  // effect 안의 타이머가 최신 onFinish를 부르도록 ref로 넘긴다.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  useEffect(() => {
    startedAt.current = performance.now();
    boardRef.current?.focus();

    // 대기 중에 탭을 벗어나면 타이머가 느려져 대기 시간이 달라지므로 무효로 끝낸다.
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        finishRef.current(null, performance.now());
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let timeout: ReturnType<typeof setTimeout>;
    let frame = 0;
    const wait = setTimeout(() => {
      setPhase("signal");
      // 바뀐 화면이 그려지는 프레임 시각을 신호 시각으로 쓴다.
      frame = requestAnimationFrame((time) => {
        signalAt.current = time;
      });
      timeout = setTimeout(
        () => finishRef.current(null, performance.now()),
        REACTION_TIMEOUT_MS + 100,
      );
    }, randomWaitMs());

    return () => {
      clearTimeout(wait);
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const press = (at: number) => {
    // 신호 전 입력, 그리고 신호 프레임이 그려지기 전 입력은 신호를 보고 누른 것이 아니다.
    finish(signalAt.current === null ? null : toReactionMs(at - signalAt.current), at);
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button === 0) {
      press(event.timeStamp);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== " " || event.repeat) {
      return;
    }
    // 버튼의 기본 동작(keyup 때 click)을 막는다.
    event.preventDefault();
    press(event.timeStamp);
  };

  const signal = phase === "signal";

  return (
    <GameBoard
      ref={boardRef}
      tone={signal ? "signal" : "soft"}
      label={signal ? "지금!" : "기다리세요"}
      description={signal ? "누르세요." : "색이 바뀌면 누르세요."}
      inputs={["click", "touch", "space"]}
      aria-label={signal ? "지금 누르세요" : "기다리세요. 색이 바뀌면 누르세요."}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}
