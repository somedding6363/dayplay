import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/shared/lib";

type GameBoardTone = "soft" | "signal";

interface GameBoardProps extends ComponentProps<"button"> {
  label: ReactNode;
  description?: ReactNode;
  inputs?: string[];
  // signal은 반응해야 하는 순간이다. 판 전체를 게임 색으로 바꾼다.
  tone?: GameBoardTone;
}

const toneClass: Record<GameBoardTone, { board: string; ring: string; input: string }> = {
  soft: { board: "bg-game-soft text-game-ink", ring: "bg-game-soft", input: "text-game" },
  // 흰 글자는 게임 색 위에서 대비가 3:1 수준이라 작은 안내 글자까지 읽히도록 ink를 쓴다.
  signal: { board: "bg-game text-ink", ring: "bg-game", input: "text-ink" },
};

export function GameBoard({
  label,
  description,
  inputs,
  tone = "soft",
  className,
  ...props
}: GameBoardProps) {
  return (
    <button
      type="button"
      className={cx(
        "@container relative block aspect-board min-h-64 w-full touch-manipulation overflow-hidden rounded-md text-left select-none",
        toneClass[tone].board,
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute -top-24 -right-24 flex size-96 items-start justify-end rounded-full bg-game-mid/40"
      >
        <span className={cx("size-72 rounded-full", toneClass[tone].ring)} />
      </span>

      {/* 화면 폭이 아니라 판 자체의 폭에 맞춰 크기를 바꾼다.
          가장 긴 라벨("기다리세요", "10000ms", "20.000초")과 입력 표시가 한 줄에 들어가는 폭에서만 글자를 키운다. */}
      <span className="relative flex size-full items-end justify-between gap-6 p-8 @md:p-12">
        <span className="relative flex flex-col gap-3">
          <span className="text-display-lg break-keep @md:text-hero-display @xl:text-board-label">
            {label}
          </span>
          {description ? <span className="text-tagline break-keep">{description}</span> : null}
        </span>

        {inputs ? (
          <span
            aria-hidden="true"
            className={cx(
              "relative hidden flex-col gap-1 text-caption tracking-widest uppercase @xs:flex",
              toneClass[tone].input,
            )}
          >
            {inputs.map((input) => (
              <span key={input}>{input}</span>
            ))}
          </span>
        ) : null}
      </span>
    </button>
  );
}
