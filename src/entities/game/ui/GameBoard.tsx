import type { ComponentProps, ReactNode } from "react";
import { cx } from "@/shared/lib";

type GameBoardTone = "soft" | "signal";

const toneClass: Record<GameBoardTone, { board: string; ring: string; input: string }> = {
  soft: { board: "bg-game-soft text-game-ink", ring: "bg-game-soft", input: "text-game" },
  // 흰 글자는 게임 색 위에서 대비가 3:1 수준이라 작은 안내 글자까지 읽히도록 ink를 쓴다.
  signal: { board: "bg-game text-ink", ring: "bg-game", input: "text-ink" },
};

const surfaceBaseClass =
  "@container relative block min-h-64 w-full overflow-hidden rounded-md text-left select-none";
const surfaceClass = cx(surfaceBaseClass, "aspect-board");

// 게임 판과 같은 모양의 표면. 판 전체가 버튼이 아닌 게임(격자 등)이 쓴다.
// 비율은 게임이 정한다. 기본 판은 aspect-board다.
export const gameSurfaceBaseClass = cx(surfaceBaseClass, toneClass.soft.board);

interface BoardFaceProps {
  label: ReactNode;
  description?: ReactNode;
  tone: GameBoardTone;
  // 오른쪽 아래의 입력 안내(CLICK, TOUCH, SPACE)
  inputs?: string[];
  // 라벨 아래의 행동. 예: 시작 버튼
  action?: ReactNode;
}

// 게임 판과 게임 패널이 함께 쓰는 장식과 글자 배치.
function BoardFace({ label, description, tone, inputs, action }: BoardFaceProps) {
  return (
    <>
      <span
        aria-hidden="true"
        className="absolute -top-24 -right-24 flex size-96 items-start justify-end rounded-full bg-game-mid/40"
      >
        <span className={cx("size-72 rounded-full", toneClass[tone].ring)} />
      </span>

      {/* 화면 폭이 아니라 판 자체의 폭에 맞춰 크기를 바꾼다.
          가장 긴 라벨("기다리세요", "10000ms", "20.000초")과 입력 표시가 한 줄에 들어가는 폭에서만 글자를 키운다. */}
      <span className="relative flex size-full items-end justify-between gap-6 p-4 @md:p-6">
        <span className="relative flex flex-col gap-3">
          <span className="text-display-md break-keep @md:text-display-lg @xl:text-hero-display">
            {label}
          </span>
          {description ? <span className="text-body-strong break-keep">{description}</span> : null}
          {action ? <span className="mt-3 flex">{action}</span> : null}
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
    </>
  );
}

interface GameBoardProps extends ComponentProps<"button"> {
  label: ReactNode;
  description?: ReactNode;
  inputs?: string[];
  // signal은 반응해야 하는 순간이다. 판 전체를 게임 색으로 바꾼다.
  tone?: GameBoardTone;
}

// 판 전체가 조작 영역인 게임 판. 반응속도처럼 판 어디를 눌러도 되는 play 중에 쓴다.
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
      className={cx(surfaceClass, "touch-manipulation", toneClass[tone].board, className)}
      {...props}
    >
      <BoardFace label={label} description={description} inputs={inputs} tone={tone} />
    </button>
  );
}

interface GamePanelProps extends ComponentProps<"div"> {
  label: ReactNode;
  description?: ReactNode;
  // 판 아래쪽의 행동. 판 자체는 눌러도 아무 일이 없다.
  action?: ReactNode;
}

// 보여주기만 하는 게임 판. 시작 전과 결과처럼 판을 눌러 실수로 시작하면 안 되는 상태에 쓴다.
export function GamePanel({ label, description, action, className, ...props }: GamePanelProps) {
  return (
    <div className={cx(gameSurfaceBaseClass, "aspect-board", className)} {...props}>
      <BoardFace label={label} description={description} action={action} tone="soft" />
    </div>
  );
}
