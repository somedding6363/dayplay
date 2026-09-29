"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import { STEP_SECONDS, hasCrashed, startPlane, stepPlane, type Steer } from "../model/flight";
import type { PaperPlaneResult } from "../model/rules";
import { drawScene, readSceneColors } from "./draw-scene";

type Control = "left" | "right" | "lift";

const keyControls: Record<string, Control> = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "lift",
  " ": "lift",
};
// 방향은 왼쪽, 띄우기는 오른쪽에 모아 양손으로 나눠 누른다.
const controls: { control: Control; label: string; key: string; hint: string }[] = [
  { control: "left", label: "왼쪽", key: "ArrowLeft", hint: "←" },
  { control: "right", label: "오른쪽", key: "ArrowRight", hint: "→" },
  { control: "lift", label: "띄우기", key: "ArrowUp Space", hint: "↑" },
];
// 부딪힌 모습을 보여주고 끝내기까지의 시간(ms)
const CRASH_REVEAL_MS = 700;

// 양쪽을 함께 누르면 서로 지워 0이 된다.
function steerOf(left: boolean, right: boolean): Steer {
  if (left === right) return 0;
  return right ? 1 : -1;
}

// 뒤에서 본 종이비행기가 앞으로 날아간다. 좌우로 틀고, 누르고 있는 동안 떠오르며 다가오는 건물을 피한다.
// 땅이나 건물에 부딪히면 끝나고 날아간 거리가 기록이다.
// 시간은 고정된 간격(STEP_SECONDS)으로 첫 프레임부터 시뮬레이션한다.
export function PaperPlaneGame({ onFinish }: GameProps<PaperPlaneResult>) {
  const [hud, setHud] = useState({ distance: 0, crashed: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const held = useRef<Record<Control, boolean>>({ left: false, right: false, lift: false });
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = readSceneColors(canvas);
    let plane = startPlane();
    let crashed = false;
    let startedAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const draw = () => drawScene(canvas, plane, colors, crashed);
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let frame = requestAnimationFrame(function tick(time) {
      // 첫 장면이 그려지는 프레임을 시작 시각으로 쓴다.
      startedAt ??= time;
      // 탭을 벗어나 프레임이 멈췄다가 돌아오면 지난 시간만큼 한꺼번에 움직인다.
      const target = (time - startedAt) / 1000;
      const steer = steerOf(held.current.left, held.current.right);
      const lifting = held.current.lift;
      while (plane.time + STEP_SECONDS <= target) {
        plane = stepPlane(plane, steer, lifting);
        if (hasCrashed(plane)) {
          crashed = true;
          const result = {
            distance: Math.floor(plane.distance),
            elapsedMs: Math.round(plane.time * 1000),
          };
          draw();
          setHud({ distance: result.distance, crashed: true });
          timer = setTimeout(() => onFinishRef.current(result), CRASH_REVEAL_MS);
          return;
        }
      }
      draw();
      setHud({ distance: Math.floor(plane.distance), crashed: false });
      frame = requestAnimationFrame(tick);
    });

    const release = () => {
      held.current = { left: false, right: false, lift: false };
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
      clearTimeout(timer);
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
      {/* 장면은 판 전체를 채우고, 거리와 조작 버튼은 그 위에 겹쳐 놓는다. */}
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div className="relative flex size-full flex-col justify-between p-4 @md:p-6">
        <div className="flex items-center gap-4 text-caption-strong tabular-nums">
          <span>{hud.distance}m</span>
          {hud.crashed ? <span className="ml-auto">부딪혔어요</span> : null}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {controls.map(({ control, label, key, hint }) => (
            <Button
              key={control}
              size="lg"
              variant={control === "lift" ? "primary" : "soft"}
              className="touch-none px-2 whitespace-nowrap select-none"
              aria-keyshortcuts={key}
              {...holdProps(control)}
            >
              {label}
              {/* 판이 좁으면 버튼이 한 줄에 들어가도록 키캡을 숨긴다. */}
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
