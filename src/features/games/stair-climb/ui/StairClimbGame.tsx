"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { GAUGE_MAX_MS, STEP_BONUS_MS, drainRate, type StairClimbResult } from "../model/rules";
import { extendStairs, facingAfter, type Direction, type StairAction } from "../model/stairs";

// 계단 한 칸의 화면 크기(px). 계단 위치는 오른 칸 수에 따라 바뀌는 값이라 style로 준다.
const STEP_WIDTH = 44;
const STEP_HEIGHT = 26;
// 캐릭터 아래로 보여줄 칸 수와 위로 보여줄 칸 수
const BELOW = 2;
const ABOVE = 9;
const keyActions: Record<string, StairAction> = { " ": "turn", ArrowUp: "climb" };

interface Climb {
  directions: Direction[];
  // 계단 i칸째의 가로 위치(칸 단위). 0번 칸이 0이다.
  offsets: number[];
  position: number;
  // 캐릭터가 보는 방향. 오르기는 이 방향으로 오른다.
  facing: Direction;
}

function extend(climb: Climb, count: number): Climb {
  const directions = extendStairs(climb.directions, count);
  const offsets = [...climb.offsets];
  for (let i = offsets.length; i < directions.length; i += 1) {
    offsets.push(i === 0 ? 0 : offsets[i - 1] + directions[i]);
  }
  return { ...climb, directions, offsets };
}

// 시간 게이지가 다 떨어지기 전에 계단을 오른다. 계단이 꺾이는 칸에서는 방향 전환을, 아니면 오르기를 누른다.
// 틀리게 누르면 끝난다.
// 시간은 performance.now()와 같은 기준(event.timeStamp, requestAnimationFrame 인자)으로 잰다.
export function StairClimbGame({ onFinish }: GameProps<StairClimbResult>) {
  const [climb, setClimb] = useState<Climb>(() =>
    extend({ directions: [1], offsets: [], position: 0, facing: 1 }, 40),
  );
  const [gaugeRatio, setGaugeRatio] = useState(1);
  const climbRef = useRef(climb);
  const gauge = useRef(GAUGE_MAX_MS);
  // 게이지를 마지막으로 계산한 시각
  const gaugeAt = useRef<number | null>(null);
  const startedAt = useRef<number | null>(null);
  const mountedAt = useRef(0);
  const finished = useRef(false);

  const finish = (at: number) => {
    if (finished.current) {
      return;
    }
    finished.current = true;
    const elapsed = Math.floor(at - (startedAt.current ?? mountedAt.current));
    onFinish({ steps: climbRef.current.position, elapsedMs: Math.max(elapsed, 0) });
  };
  // effect 안의 타이머와 키 입력이 최신 onFinish를 부르도록 ref로 넘긴다.
  const finishRef = useRef(finish);

  // at 시각까지 게이지를 줄인다. 다 떨어졌으면 떨어진 정확한 시각에 끝내고 false를 돌려준다.
  const drainUntil = (at: number) => {
    const from = gaugeAt.current ?? at;
    const rate = drainRate(climbRef.current.position);
    const left = gauge.current - (at - from) * rate;
    if (left <= 0) {
      finish(from + gauge.current / rate);
      return false;
    }
    gauge.current = left;
    gaugeAt.current = at;
    return true;
  };

  const press = (action: StairAction, at: number) => {
    if (finished.current || !drainUntil(at)) {
      return;
    }
    const current = climbRef.current;
    const facing = facingAfter(current.facing, action);
    if (facing !== current.directions[current.position + 1]) {
      finish(at);
      return;
    }
    gauge.current = Math.min(GAUGE_MAX_MS, gauge.current + STEP_BONUS_MS);
    const moved = { ...current, position: current.position + 1, facing };
    const next =
      moved.position + ABOVE + 10 > moved.directions.length
        ? extend(moved, moved.directions.length + 40)
        : moved;
    climbRef.current = next;
    setClimb(next);
    setGaugeRatio(gauge.current / GAUGE_MAX_MS);
  };
  const pressRef = useRef(press);

  useEffect(() => {
    finishRef.current = finish;
    pressRef.current = press;
  });

  useEffect(() => {
    mountedAt.current = performance.now();
    let frame = requestAnimationFrame(function tick(time) {
      // 첫 계단이 그려지는 프레임을 시작 시각으로 쓴다.
      startedAt.current ??= time;
      gaugeAt.current ??= time;
      if (finished.current) {
        return;
      }
      // 탭을 벗어나 프레임이 멈췄다가 돌아와도 지난 시간만큼 한꺼번에 줄어 끝난다.
      const from = gaugeAt.current;
      const rate = drainRate(climbRef.current.position);
      const left = gauge.current - (time - from) * rate;
      if (left <= 0) {
        finishRef.current(from + gauge.current / rate);
        return;
      }
      gauge.current = left;
      gaugeAt.current = time;
      setGaugeRatio(left / GAUGE_MAX_MS);
      frame = requestAnimationFrame(tick);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      const action = keyActions[event.key];
      if (!action || event.repeat) {
        return;
      }
      // 스페이스바가 focus된 버튼을 누르거나 화면을 스크롤하지 않게 막는다.
      event.preventDefault();
      pressRef.current(action, event.timeStamp);
    };
    // 조작 버튼을 누른 뒤 그 버튼에 focus가 남아 있으면 스페이스바를 뗄 때 버튼 click이 한 번 더 일어난다.
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // 누르는 순간 반응하도록 포인터는 pointerdown으로 받는다. 키보드·보조 기술의 click(detail 0)도 받는다.
  const controlProps = (action: StairAction) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button === 0) {
        press(action, event.timeStamp);
      }
    },
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      if (event.detail === 0) {
        press(action, event.timeStamp);
      }
    },
  });

  const { position, offsets, facing } = climb;
  const visible = offsets
    .map((offset, index) => ({ index, dx: offset - offsets[position], dy: index - position }))
    .filter(({ dy }) => dy >= -BELOW && dy <= ABOVE);

  return (
    <div className={cx(gameSurfaceBaseClass, "aspect-square sm:aspect-board")}>
      <div className="relative flex size-full flex-col gap-3 p-4 @md:p-6">
        <div className="flex items-center gap-4">
          <span className="text-caption-strong tabular-nums">{position}계단</span>
          <span
            role="progressbar"
            aria-label="남은 시간"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(gaugeRatio * 100)}
            className="h-2 flex-1 overflow-hidden rounded-full bg-game-mid"
          >
            <span
              className="block h-full rounded-full bg-game-ink"
              style={{ width: `${gaugeRatio * 100}%` }}
            />
          </span>
        </div>

        <div aria-hidden="true" className="relative min-h-0 flex-1 overflow-hidden">
          {visible.map(({ index, dx, dy }) => (
            <span
              key={index}
              className={cx("absolute h-2.5 rounded-2xs", dy === 0 ? "bg-game-ink" : "bg-game")}
              style={{
                width: STEP_WIDTH,
                left: `calc(50% + ${dx * STEP_WIDTH - STEP_WIDTH / 2}px)`,
                bottom: (dy + BELOW) * STEP_HEIGHT,
              }}
            />
          ))}
          {/* 캐릭터. 보는 방향 쪽에 눈을 둔다. */}
          <span
            className="absolute size-6 rounded-full bg-game-ink"
            style={{ left: "calc(50% - 12px)", bottom: BELOW * STEP_HEIGHT + 10 }}
          >
            <span
              className={cx(
                "absolute top-1.5 size-1.5 rounded-full bg-game-soft",
                facing === 1 ? "right-1" : "left-1",
              )}
            />
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-center text-caption text-muted">
            키보드는 스페이스바로 방향 전환, ↑로 오르기
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="soft"
              className="touch-manipulation"
              {...controlProps("turn")}
            >
              방향 전환
            </Button>
            <Button size="lg" className="touch-manipulation" {...controlProps("climb")}>
              오르기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
