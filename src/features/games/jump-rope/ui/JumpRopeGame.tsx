"use client";

import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { Kbd } from "@/shared/ui/kbd";
import { STEP_SECONDS, jump, startRope, stepRope, type Rope } from "../model/rope";
import type { JumpRopeResult } from "../model/rules";
import { drawScene, readSceneColors } from "./draw-scene";

const jumpKeys = new Set([" ", "ArrowUp"]);
// 걸린 모습을 보여주고 끝내기까지의 시간(ms)
const CAUGHT_REVEAL_MS = 800;

// 양쪽 기둥에서 도는 긴 줄이 공 밑에 올 때 맞춰 뛰어넘는다. 줄에 걸리면 끝나고 넘은 횟수가 기록이다.
// 시간은 고정된 간격(STEP_SECONDS)으로 첫 프레임부터 시뮬레이션한다.
export function JumpRopeGame({ onFinish }: GameProps<JumpRopeResult>) {
  const [hud, setHud] = useState({ jumps: 0, caught: false });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 누른 입력은 다음 시뮬레이션 걸음에서 점프로 바꾼다.
  const pressed = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = readSceneColors(canvas);
    let rope: Rope = startRope();
    let startedAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const draw = () => drawScene(canvas, rope, colors);
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
      // 탭을 벗어나 프레임이 멈췄다가 돌아오면 지난 시간만큼 한꺼번에 움직여 대개 걸린다.
      const target = (time - startedAt) / 1000;
      if (pressed.current) {
        pressed.current = false;
        rope = jump(rope);
      }
      while (rope.time + STEP_SECONDS <= target) {
        rope = stepRope(rope);
        if (rope.caught) {
          const result = { jumps: rope.jumps, elapsedMs: Math.round(rope.time * 1000) };
          draw();
          setHud({ jumps: rope.jumps, caught: true });
          timer = setTimeout(() => onFinishRef.current(result), CAUGHT_REVEAL_MS);
          return;
        }
      }
      draw();
      setHud({ jumps: rope.jumps, caught: false });
      frame = requestAnimationFrame(tick);
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!jumpKeys.has(event.key)) return;
      // 스페이스바·화살표가 focus된 버튼을 누르거나 화면을 스크롤하지 않게 막는다.
      event.preventDefault();
      if (!event.repeat) pressed.current = true;
    };
    // 버튼에 focus가 남아 있으면 스페이스바를 뗄 때 버튼 click이 한 번 더 일어난다.
    const onKeyUp = (event: KeyboardEvent) => {
      if (jumpKeys.has(event.key)) event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className={cx(gameSurfaceBaseClass, "aspect-square overflow-hidden sm:aspect-board")}>
      {/* 장면은 판 전체를 채우고, 횟수와 점프 버튼은 그 위에 겹쳐 놓는다. */}
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <div className="relative flex size-full flex-col justify-between p-4 @md:p-6">
        <div className="flex items-center gap-4 text-caption-strong tabular-nums">
          <span>{hud.jumps}번</span>
          {hud.caught ? <span className="ml-auto">줄에 걸렸어요</span> : null}
        </div>

        {/* 누르는 순간 반응하도록 포인터는 pointerdown으로 받는다. 키보드·보조 기술의 click(detail 0)도 받는다. */}
        <Button
          size="lg"
          className="touch-none whitespace-nowrap select-none"
          aria-keyshortcuts="Space ArrowUp"
          draggable={false}
          onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
            if (event.button === 0) pressed.current = true;
          }}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (event.detail === 0) pressed.current = true;
          }}
          onContextMenu={(event) => event.preventDefault()}
          onDragStart={(event) => event.preventDefault()}
        >
          점프 <Kbd>Space</Kbd>
        </Button>
      </div>
    </div>
  );
}
