"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import type { RacingResult } from "../model/rules";
import {
  LAPS,
  STEP_SECONDS,
  isFinished,
  lapsDone,
  startCar,
  stepCar,
  type Surface,
} from "../model/track";
import { drawCar, drawTrack, readRaceColors } from "./draw-race";

type Control = "left" | "right" | "accelerate" | "reverse";

const keyControls: Record<string, Control> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "accelerate",
  " ": "accelerate",
  ArrowDown: "reverse",
};

// 조향은 왼쪽, 후진·악셀은 오른쪽에 모아 양손으로 나눠 누른다.
const controls: { control: Control; label: string; key: string; hint: string }[] = [
  { control: "left", label: "왼쪽", key: "ArrowLeft", hint: "←" },
  { control: "right", label: "오른쪽", key: "ArrowRight", hint: "→" },
  { control: "reverse", label: "후진", key: "ArrowDown", hint: "↓" },
  { control: "accelerate", label: "악셀", key: "ArrowUp Space", hint: "↑" },
];

// 양쪽을 함께 누르면 서로 지워 0이 된다.
function axis(negative: boolean, positive: boolean): -1 | 0 | 1 {
  if (negative === positive) return 0;
  return positive ? 1 : -1;
}

interface Hud {
  lap: number;
  seconds: number;
  surface: Surface;
  blocked: boolean;
}

// 누르지 않아도 기본 속도로 달린다. 악셀로 더 빨라지고 후진으로 서거나 뒤로 가며, 좌우로 조향한다. 모래에서는 느려지고 벽에 닿으면 막혀 선다.
// 세 바퀴를 돌아야 끝나고 중간에 끝나는 일은 없다.
// 버튼과 키는 누르고 있는 동안 계속 적용된다.
// 차는 고정된 시간 간격(STEP_SECONDS)으로 움직이고, 기록은 첫 프레임부터 시뮬레이션한 시간이다.
export function RacingGame({ onFinish }: GameProps<RacingResult>) {
  const [hud, setHud] = useState<Hud>({ lap: 1, seconds: 0, surface: "road", blocked: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const held = useRef<Record<Control, boolean>>({
    left: false,
    right: false,
    accelerate: false,
    reverse: false,
  });
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const track = document.createElement("canvas");
    const colors = readRaceColors(canvas);
    let car = startCar();
    let simulated = 0;
    let startedAt: number | null = null;

    const draw = () => drawCar(canvas, track, car, colors);
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = track.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = track.height = Math.round(canvas.clientHeight * ratio);
      drawTrack(track, colors);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = requestAnimationFrame(function tick(time) {
      // 첫 트랙이 그려지는 프레임을 시작 시각으로 쓴다.
      startedAt ??= time;
      // 탭을 벗어나 프레임이 멈췄다가 돌아오면 지난 시간만큼 한꺼번에 움직인다.
      const target = (time - startedAt) / 1000;
      const { left, right, accelerate, reverse } = held.current;
      const input = { steer: axis(left, right), throttle: axis(reverse, accelerate) };
      while (simulated + STEP_SECONDS <= target) {
        car = stepCar(car, input);
        simulated += STEP_SECONDS;
        if (isFinished(car)) {
          draw();
          onFinishRef.current({ ms: Math.round(simulated * 1000) });
          return;
        }
      }
      draw();
      setHud({
        lap: Math.max(1, Math.min(lapsDone(car) + 1, LAPS)),
        seconds: simulated,
        surface: car.surface,
        blocked: car.blocked,
      });
      frame = requestAnimationFrame(tick);
    });

    const release = () => {
      held.current = { left: false, right: false, accelerate: false, reverse: false };
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const control = keyControls[event.key];
      if (!control) return;
      // 스페이스바·화살표가 focus된 버튼을 누르거나 화면을 스크롤하지 않게 막는다.
      event.preventDefault();
      held.current[control] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const control = keyControls[event.key];
      if (!control) return;
      event.preventDefault();
      held.current[control] = false;
    };
    // 탭을 벗어나면 keyup이 오지 않을 수 있어 누르던 입력을 모두 뗀다.
    const onVisibilityChange = () => {
      if (document.hidden) release();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // 누르고 있는 동안 적용한다. 버튼 밖으로 손가락이 나가도 떼기 전까지는 누른 것으로 본다.
  const holdProps = (control: Control) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      held.current[control] = true;
    },
    onPointerUp: () => {
      held.current[control] = false;
    },
    onPointerCancel: () => {
      held.current[control] = false;
    },
    onLostPointerCapture: () => {
      held.current[control] = false;
    },
    // 길게 누를 때 뜨는 메뉴와 글자 선택·끌기를 막는다.
    onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
    onDragStart: (event: { preventDefault: () => void }) => event.preventDefault(),
    draggable: false,
  });

  return (
    <div className={cx(gameSurfaceBaseClass, "aspect-square overflow-hidden sm:aspect-board")}>
      <div className="relative flex size-full flex-col gap-3 p-4 @md:p-6">
        <div className="flex items-center gap-4 text-caption-strong tabular-nums">
          <span>
            {hud.lap}/{LAPS}바퀴
          </span>
          <span>{hud.seconds.toFixed(1)}초</span>
          {hud.blocked ? (
            <span className="ml-auto">벽에 막혔어요</span>
          ) : hud.surface === "sand" ? (
            <span className="ml-auto">모래에서 느려져요</span>
          ) : null}
        </div>

        <canvas ref={canvasRef} aria-hidden="true" className="min-h-0 w-full flex-1 rounded-xs" />

        <div className="grid grid-cols-4 gap-2 @md:gap-3">
          {controls.map(({ control, label, key, hint }) => (
            <Button
              key={control}
              size="lg"
              variant={control === "accelerate" ? "primary" : "soft"}
              className="touch-none px-2 whitespace-nowrap select-none"
              aria-keyshortcuts={key}
              {...holdProps(control)}
            >
              {label}
              {/* 판이 좁으면 네 버튼이 한 줄에 들어가도록 키캡을 숨긴다. */}
              <span className="hidden @lg:contents">
                <Kbd>{hint}</Kbd>
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
