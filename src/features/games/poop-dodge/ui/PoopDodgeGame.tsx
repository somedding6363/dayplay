"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { DodgerIcon, PoopIcon } from "@/shared/ui/icons";
import { Kbd } from "@/shared/ui/kbd";
import {
  PLAYER_SIZE,
  PLAYER_Y,
  POOP_SIZE,
  STEP_SECONDS,
  hitPoop,
  startField,
  stepField,
  type Field,
  type Move,
} from "../model/field";
import type { PoopDodgeResult } from "../model/rules";

type Side = "left" | "right";

const keySides: Record<string, Side> = { ArrowLeft: "left", ArrowRight: "right" };
const controls: { side: Side; label: string; key: string; hint: string }[] = [
  { side: "left", label: "왼쪽", key: "ArrowLeft", hint: "←" },
  { side: "right", label: "오른쪽", key: "ArrowRight", hint: "→" },
];
// 맞은 모습을 보여주고 끝내기까지의 시간(ms)
const HIT_REVEAL_MS = 700;

// 양쪽을 함께 누르면 서로 지워 0이 된다.
function moveOf(left: boolean, right: boolean): Move {
  if (left === right) return 0;
  return right ? 1 : -1;
}

// 판 좌표(0~100)를 정사각형 판 안의 % 위치로 바꾼다.
const box = (x: number, y: number, size: number) => ({
  left: `${x - size / 2}%`,
  top: `${y - size / 2}%`,
  width: `${size}%`,
  height: `${size}%`,
});

// 위에서 떨어지는 똥을 좌우로 움직여 피한다. 맞을 때까지 버틴 시간이 기록이다.
// 시간은 고정된 간격(STEP_SECONDS)으로 첫 프레임부터 시뮬레이션한다.
export function PoopDodgeGame({ onFinish }: GameProps<PoopDodgeResult>) {
  const [field, setField] = useState<Field>(startField);
  const [hitId, setHitId] = useState<number | null>(null);
  const held = useRef<Record<Side, boolean>>({ left: false, right: false });
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  useEffect(() => {
    let current = startField();
    let startedAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    let frame = requestAnimationFrame(function tick(time) {
      // 첫 판이 그려지는 프레임을 시작 시각으로 쓴다.
      startedAt ??= time;
      // 탭을 벗어나 프레임이 멈췄다가 돌아오면 지난 시간만큼 한꺼번에 움직인다.
      const target = (time - startedAt) / 1000;
      const move = moveOf(held.current.left, held.current.right);
      while (current.time + STEP_SECONDS <= target) {
        current = stepField(current, move);
        const hit = hitPoop(current);
        if (hit) {
          const ms = Math.round(current.time * 1000);
          setField(current);
          setHitId(hit.id);
          timer = setTimeout(() => onFinishRef.current({ ms }), HIT_REVEAL_MS);
          return;
        }
      }
      setField(current);
      frame = requestAnimationFrame(tick);
    });

    const release = () => {
      held.current = { left: false, right: false };
    };
    const onKeyDown = (event: KeyboardEvent) => {
      const side = keySides[event.key];
      if (!side) return;
      // 화살표가 화면을 스크롤하지 않게 막는다.
      event.preventDefault();
      held.current[side] = true;
    };
    const onKeyUp = (event: KeyboardEvent) => {
      const side = keySides[event.key];
      if (!side) return;
      event.preventDefault();
      held.current[side] = false;
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
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // 누르고 있는 동안 적용한다. 버튼 밖으로 손가락이 나가도 떼기 전까지는 누른 것으로 본다.
  const holdProps = (side: Side) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      held.current[side] = true;
    },
    onPointerUp: () => {
      held.current[side] = false;
    },
    onPointerCancel: () => {
      held.current[side] = false;
    },
    onLostPointerCapture: () => {
      held.current[side] = false;
    },
    // 길게 누를 때 뜨는 메뉴와 글자 선택·끌기를 막는다.
    onContextMenu: (event: { preventDefault: () => void }) => event.preventDefault(),
    onDragStart: (event: { preventDefault: () => void }) => event.preventDefault(),
    draggable: false,
  });

  const hit = hitId !== null;

  return (
    <div className={cx(gameSurfaceBaseClass, "aspect-square overflow-hidden sm:aspect-board")}>
      <div className="relative flex size-full flex-col gap-3 p-4 @md:p-6">
        <div className="flex items-center gap-4 text-caption-strong tabular-nums">
          <span>{field.time.toFixed(1)}초</span>
          {hit ? <span className="ml-auto">똥에 맞았어요</span> : null}
        </div>

        {/* 판 크기와 상관없이 정사각형으로 그려 보이는 크기와 맞는 범위가 같다. */}
        <div className="flex min-h-0 flex-1 items-center justify-center @container-size">
          <div
            aria-hidden="true"
            className="relative aspect-square overflow-hidden rounded-xs bg-canvas"
            style={{ width: "min(100cqw, 100cqh)" }}
          >
            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-game-mid" />
            {field.poops.map((poop) => (
              <PoopIcon
                key={poop.id}
                className={cx("absolute text-game", poop.id === hitId && "scale-125")}
                style={box(poop.x, poop.y, POOP_SIZE)}
              />
            ))}
            <DodgerIcon
              hit={hit}
              className="absolute text-ink"
              style={box(field.playerX, PLAYER_Y, PLAYER_SIZE)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {controls.map(({ side, label, key, hint }) => (
            <Button
              key={side}
              size="lg"
              variant="soft"
              className="touch-none whitespace-nowrap select-none"
              aria-keyshortcuts={key}
              {...holdProps(side)}
            >
              {label} <Kbd>{hint}</Kbd>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
