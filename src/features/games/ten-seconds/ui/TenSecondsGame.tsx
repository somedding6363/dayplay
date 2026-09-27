"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { GameBoard, type GameProps } from "@/entities/game";
import {
  TIMEOUT_MS,
  VISIBLE_MS,
  formatSeconds,
  toElapsedMs,
  type TenSecondsResult,
} from "../model/rules";

// 시간은 모두 performance.now()와 같은 기준(event.timeStamp, requestAnimationFrame 인자)으로 잰다.
// 탭을 벗어나도 기준 시각이 흐르므로 무효로 하지 않는다.
export function TenSecondsGame({ onFinish }: GameProps<TenSecondsResult>) {
  // 처음 3초 동안 보여줄 경과 시간. null이면 가린다.
  const [shownMs, setShownMs] = useState<number | null>(0);
  const boardRef = useRef<HTMLButtonElement>(null);
  const startedAt = useRef<number | null>(null);
  // 첫 프레임 전에 누른 입력은 마운트 시각부터 잰다.
  const mountedAt = useRef(0);
  const finished = useRef(false);

  const finish = (elapsedMs: number | null) => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    onFinish({ elapsedMs });
  };
  // effect 안의 타이머가 최신 onFinish를 부르도록 ref로 넘긴다.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  useEffect(() => {
    mountedAt.current = performance.now();
    boardRef.current?.focus();

    let frame = requestAnimationFrame(function tick(time) {
      // 0초가 그려지는 첫 프레임을 시작 시각으로 쓴다.
      startedAt.current ??= time;
      const elapsed = time - startedAt.current;
      if (elapsed < VISIBLE_MS) {
        setShownMs(elapsed);
        frame = requestAnimationFrame(tick);
      } else {
        setShownMs(null);
      }
    });
    const timeout = setTimeout(() => finishRef.current(null), TIMEOUT_MS + 100);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timeout);
    };
  }, []);

  const press = (at: number) => {
    finish(toElapsedMs(at - (startedAt.current ?? mountedAt.current)));
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

  const hidden = shownMs === null;

  return (
    <GameBoard
      ref={boardRef}
      label={hidden ? "?.???초" : `${formatSeconds(shownMs)}초`}
      description={hidden ? "10초라고 생각할 때 누르세요." : "시간이 흐르고 있어요."}
      inputs={["click", "touch", "space"]}
      // 흐르는 숫자는 읽지 않는다. 시간이 가려진 뒤에만 이름이 바뀐다.
      aria-label={
        hidden ? "시간을 가렸어요. 10초라고 생각할 때 누르세요." : "시간이 흐르고 있어요."
      }
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
    />
  );
}
