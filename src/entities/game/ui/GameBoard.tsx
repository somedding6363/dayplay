import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/shared/lib";

interface GameBoardProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: ReactNode;
  description?: ReactNode;
  inputs?: string[];
}

export function GameBoard({ label, description, inputs, className, ...props }: GameBoardProps) {
  return (
    <button
      type="button"
      className={cx(
        "@container relative block aspect-board min-h-64 w-full overflow-hidden rounded-md bg-game-soft text-left text-game-ink",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="absolute -top-24 -right-24 flex size-96 items-start justify-end rounded-full bg-game-mid/40"
      >
        <span className="size-72 rounded-full bg-game-soft" />
      </span>

      {/* 화면 폭이 아니라 판 자체의 폭에 맞춰 크기를 바꾼다. */}
      <span className="relative flex size-full items-end justify-between gap-6 p-8 @md:p-12">
        <span className="relative flex flex-col gap-3">
          <span className="text-hero-display break-keep @md:text-board-label">{label}</span>
          {description ? <span className="text-tagline break-keep">{description}</span> : null}
        </span>

        {inputs ? (
          <span
            aria-hidden="true"
            className="relative flex flex-col gap-1 text-caption tracking-widest text-game uppercase"
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
