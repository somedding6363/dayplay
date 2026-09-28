"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { levelColors } from "../model/palette";
import { LEVEL_TIME_MS, gridSize, type OddColorResult } from "../model/rules";

const randomIndex = (size: number) => Math.floor(Math.random() * size * size);

const arrowMoves: Record<string, (index: number, size: number) => number> = {
  ArrowLeft: (index, size) => (index % size === 0 ? index : index - 1),
  ArrowRight: (index, size) => (index % size === size - 1 ? index : index + 1),
  ArrowUp: (index, size) => (index < size ? index : index - size),
  ArrowDown: (index, size) => (index + size >= size * size ? index : index + size),
};

// 단계마다 15초 안에 색이 다른 칸을 찾아 최대한 많은 단계를 넘긴다.
// 시간 안에 못 찾거나 틀린 칸을 누르면 그 자리에서 끝난다.
// 시간은 performance.now()와 같은 기준(event.timeStamp, requestAnimationFrame 인자)으로 잰다.
export function OddColorGame({ onFinish }: GameProps<OddColorResult>) {
  const [level, setLevel] = useState(1);
  const [oddIndex, setOddIndex] = useState(() => randomIndex(gridSize(1)));
  // 이번 단계에 남은 시간
  const [remainingMs, setRemainingMs] = useState(LEVEL_TIME_MS);
  // 키보드로 옮겨 다니는 칸. 이 칸만 tab 순서에 들어간다.
  const [focusIndex, setFocusIndex] = useState(0);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const startedAt = useRef<number | null>(null);
  // 이번 단계가 시작된 시각. 1단계는 첫 격자가 그려진 프레임, 이후는 앞 단계를 맞힌 입력 시각이다.
  const levelStartedAt = useRef<number | null>(null);
  const mountedAt = useRef(0);
  const found = useRef(0);
  const finished = useRef(false);

  const size = gridSize(level);
  const colors = levelColors(level);

  const finish = (at: number) => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    const elapsed = Math.round(at - (startedAt.current ?? mountedAt.current));
    onFinish({ found: found.current, elapsedMs: Math.max(elapsed, 0) });
  };
  // effect 안의 타이머가 최신 onFinish를 부르도록 ref로 넘긴다.
  const finishRef = useRef(finish);
  useEffect(() => {
    finishRef.current = finish;
  });

  useEffect(() => {
    mountedAt.current = performance.now();
    let frame = requestAnimationFrame(function tick(time) {
      // 첫 격자가 그려지는 프레임을 시작 시각으로 쓴다.
      startedAt.current ??= time;
      levelStartedAt.current ??= time;
      const remaining = LEVEL_TIME_MS - (time - levelStartedAt.current);
      setRemainingMs(Math.max(remaining, 0));
      if (remaining <= 0) {
        finishRef.current(levelStartedAt.current + LEVEL_TIME_MS);
        return;
      }
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // 탭을 벗어나 프레임이 멈춰도 단계 시간이 지나면 끝낸다.
  useEffect(() => {
    const levelStart = levelStartedAt.current ?? performance.now();
    const timeout = setTimeout(
      () => finishRef.current((levelStartedAt.current ?? levelStart) + LEVEL_TIME_MS),
      levelStart + LEVEL_TIME_MS - performance.now() + 50,
    );
    return () => clearTimeout(timeout);
  }, [level]);

  useEffect(() => {
    tiles.current[focusIndex]?.focus();
  }, [focusIndex, level]);

  const choose = (index: number, at: number) => {
    if (finished.current) {
      return;
    }
    if (index !== oddIndex) {
      finish(at);
      return;
    }
    found.current += 1;
    levelStartedAt.current = at;
    setRemainingMs(LEVEL_TIME_MS);
    const next = level + 1;
    const nextSize = gridSize(next);
    setLevel(next);
    setOddIndex(randomIndex(nextSize));
    setFocusIndex((current) => Math.min(current, nextSize * nextSize - 1));
  };

  const onTileClick = (index: number) => (event: MouseEvent<HTMLButtonElement>) =>
    choose(index, event.timeStamp);

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const move = arrowMoves[event.key];
    if (move) {
      event.preventDefault();
      setFocusIndex((current) => move(current, size));
    }
  };

  return (
    // 격자는 정사각형이라 가로로 긴 판에서는 높이에 맞춰 작아진다. 폰처럼 좁은 화면에서는 판을 정사각형으로 키워
    // 격자가 판 폭을 다 쓰게 한다.
    <div className={cx(gameSurfaceBaseClass, "aspect-square overflow-hidden sm:aspect-board")}>
      <div className="relative flex size-full flex-col gap-3 p-4 @md:p-6">
        <div className="flex items-baseline justify-between text-caption-strong tabular-nums">
          <span>{level - 1}개 찾음</span>
          <span>{(remainingMs / 1000).toFixed(1)}초</span>
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div
            role="group"
            aria-label={`${level}단계, ${size}×${size}. 색이 다른 칸을 누르세요.`}
            onKeyDown={onGridKeyDown}
            // 칸 수는 단계마다 바뀌는 값이라 style로 준다.
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
            className="grid aspect-square h-full max-w-full gap-1"
          >
            {Array.from({ length: size * size }, (_, index) => (
              <button
                key={`${level}-${index}`}
                ref={(element) => {
                  tiles.current[index] = element;
                }}
                type="button"
                tabIndex={index === focusIndex ? 0 : -1}
                aria-label={`${Math.floor(index / size) + 1}행 ${(index % size) + 1}열`}
                onClick={onTileClick(index)}
                onFocus={() => setFocusIndex(index)}
                style={{ backgroundColor: index === oddIndex ? colors.odd : colors.base }}
                className="touch-manipulation rounded-2xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-game-ink"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
