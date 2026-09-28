"use client";

import { useEffect, useRef, useState } from "react";
import { gameSurfaceBaseClass, type GameProps } from "@/entities/game";
import { cx } from "@/shared/lib";
import { Button } from "@/shared/ui/button";
import { CoinIcon } from "@/shared/ui/icons";
import { Kbd } from "@/shared/ui/kbd";
import {
  FLIP_MS,
  coinSideName,
  flipCoin,
  type CoinFlipResult,
  type CoinSide,
} from "../model/rules";

// 틀렸을 때 나온 면을 보여주고 끝내기까지의 시간
const MISS_REVEAL_MS = 900;
const keySides: Record<string, CoinSide> = { ArrowLeft: "heads", ArrowRight: "tails" };
// 동전 두께(px). 실제 동전처럼 지름의 약 7%다. 옆면은 1px 간격의 원판으로 채운다.
const COIN_THICKNESS = 8;
const edgeLayers = Array.from(
  { length: COIN_THICKNESS - 1 },
  (_, index) => index + 1 - COIN_THICKNESS / 2,
);

type Phase =
  | { name: "choosing"; last?: CoinSide }
  | { name: "flipping"; outcome: CoinSide }
  | { name: "missed"; outcome: CoinSide };

// 앞면·뒷면을 골라 동전을 던진다. 맞히면 계속하고, 틀리면 나온 면을 잠시 보여준 뒤 끝난다.
export function CoinFlipGame({ onFinish }: GameProps<CoinFlipResult>) {
  const [phase, setPhase] = useState<Phase>({ name: "choosing" });
  const [streak, setStreak] = useState(0);
  // 던질 때마다 바꿔 도는 애니메이션을 처음부터 다시 튼다.
  const [flips, setFlips] = useState(0);
  const startedAt = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    startedAt.current = performance.now();
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const guess = (side: CoinSide) => {
    if (phase.name !== "choosing") {
      return;
    }
    const outcome = flipCoin();
    setPhase({ name: "flipping", outcome });
    setFlips((count) => count + 1);
    timers.current.push(
      setTimeout(() => {
        if (outcome === side) {
          setStreak((count) => count + 1);
          setPhase({ name: "choosing", last: outcome });
          return;
        }
        setPhase({ name: "missed", outcome });
        timers.current.push(
          setTimeout(() => {
            onFinish({
              streak,
              elapsedMs: Math.round(performance.now() - startedAt.current),
            });
          }, MISS_REVEAL_MS),
        );
      }, FLIP_MS),
    );
  };
  // 키 입력이 최신 guess를 부르도록 ref로 넘긴다.
  const guessRef = useRef(guess);
  useEffect(() => {
    guessRef.current = guess;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const side = keySides[event.key];
      if (!side || event.repeat) {
        return;
      }
      event.preventDefault();
      guessRef.current(side);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // 동전이 보여주는 면. 던지는 중에는 떨어질 면으로 돌기 시작해서 그 면으로 착지한다.
  const shown: CoinSide = phase.name === "choosing" ? (phase.last ?? "heads") : phase.outcome;
  const flipping = phase.name === "flipping";

  const status =
    phase.name === "flipping"
      ? "동전을 던졌어요."
      : phase.name === "missed"
        ? `${coinSideName[phase.outcome]}이었어요.`
        : phase.last
          ? `맞혔어요! ${streak}연속`
          : "앞면일지 뒷면일지 고르세요.";

  return (
    // 동전이 판 위로 날아올라 판 밖까지 보이도록 넘치는 부분을 자르지 않는다.
    <div className={cx(gameSurfaceBaseClass, "aspect-square overflow-visible sm:aspect-board")}>
      <div className="relative flex size-full flex-col gap-3 p-4 @md:p-6">
        <span className="text-caption-strong tabular-nums">{streak}연속</span>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-end gap-4">
          {/* 탁자에 놓인 동전을 위에서 내려다본다. 던지면 카메라 쪽으로 떠오르며(커지며) 돌다가 다시 탁자로
              떨어진다(작아진다). 바깥은 떠오름(toss), 안쪽은 도는 것(spin)이다. 앞면과 뒷면을 겹치고 뒷면만 뒤집어 둔다. */}
          <div className="relative z-10 flex items-center justify-center perspective-distant">
            {/* 탁자에 깔린 그림자. 동전이 높이 뜰수록 빛 반대쪽으로 멀어지고 옅어진다. */}
            <span
              key={`shadow-${flips}`}
              aria-hidden="true"
              className={cx(
                "absolute size-28 translate-x-1 translate-y-2 rounded-full bg-ink opacity-30 blur-sm @md:size-36",
                flipping && "motion-safe:animate-coin-shadow",
              )}
            />
            <div
              key={flips}
              className={cx("transform-3d", flipping && "motion-safe:animate-coin-toss")}
            >
              <div
                className={cx(
                  "relative size-28 transform-3d @md:size-36",
                  flipping
                    ? shown === "heads"
                      ? "motion-safe:animate-coin-spin-heads"
                      : "motion-safe:animate-coin-spin-tails"
                    : shown === "tails" && "rotate-x-180",
                  // 모션을 줄이면 돌지 않고 착지한 면을 바로 보여준다.
                  flipping && shown === "tails" && "motion-reduce:rotate-x-180",
                )}
              >
                {/* 동전은 얇은 원기둥이다. 옆면은 원판을 겹쳐 만들고, 앞·뒷면은 두께의 절반만큼 띄운다.
                    짝수 칸과 홀수 칸의 색을 달리해 옆면의 톱니처럼 보이게 한다. */}
                {edgeLayers.map((z, index) => (
                  <span
                    key={z}
                    aria-hidden="true"
                    className={cx(
                      "absolute inset-0 rounded-full",
                      index % 2 === 0 ? "bg-muted" : "bg-faint",
                    )}
                    style={{ transform: `translateZ(${z}px)` }}
                  />
                ))}
                <CoinIcon
                  side="heads"
                  className="absolute inset-0 size-full text-faint backface-hidden"
                  style={{ transform: `translateZ(${COIN_THICKNESS / 2}px)` }}
                />
                <CoinIcon
                  side="tails"
                  className="absolute inset-0 size-full text-faint backface-hidden"
                  style={{ transform: `rotateX(180deg) translateZ(${COIN_THICKNESS / 2}px)` }}
                />
              </div>
            </div>
          </div>
          <p aria-live="polite" className="text-body-strong">
            {status}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="soft"
            aria-keyshortcuts="ArrowLeft"
            onClick={() => guess("heads")}
          >
            <Kbd>←</Kbd> 앞면
          </Button>
          <Button size="lg" aria-keyshortcuts="ArrowRight" onClick={() => guess("tails")}>
            뒷면 <Kbd>→</Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
}
