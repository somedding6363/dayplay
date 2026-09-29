import { useId } from "react";

// 안개처럼 겹쳐 떠 있는 같은 글자들 사이에서 가짜 글자 하나만 돋보기에 잡힌다.
export function Thumbnail() {
  const id = useId();
  // 멀수록 작고 흐리다. [x, y, 크기]
  const letters: [number, number, number][] = [
    [330, 90, 34],
    [410, 60, 28],
    [520, 70, 40],
    [600, 130, 30],
    [360, 180, 46],
    [560, 210, 52],
    [610, 300, 40],
    [300, 280, 38],
    [420, 330, 56],
    [540, 380, 44],
    [250, 150, 26],
  ];
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="text-game-soft" stopColor="currentColor" />
          <stop offset="1" className="text-game-mid" stopColor="currentColor" />
        </linearGradient>
        <radialGradient id={`${id}-lens`} cx="0.4" cy="0.35">
          <stop offset="0" className="text-canvas" stopColor="currentColor" />
          <stop offset="1" className="text-game-soft" stopColor="currentColor" />
        </radialGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-bg)`} />
      {letters.map(([x, y, s]) => (
        <text
          key={`${x}-${y}`}
          x={x}
          y={y}
          textAnchor="middle"
          className="fill-game-ink"
          fontSize={s}
          fontWeight="700"
          opacity={0.08 + (s - 26) / 120}
        >
          몽
        </text>
      ))}
      {/* 돋보기 */}
      <g transform="rotate(-20 470 190)">
        <rect x="455" y="280" width="30" height="120" rx="15" className="fill-game-ink" />
        <circle cx="470" cy="190" r="100" className="fill-game-ink" />
        <circle cx="470" cy="190" r="86" fill={`url(#${id}-lens)`} />
      </g>
      <text
        x="470"
        y="222"
        textAnchor="middle"
        className="fill-game"
        fontSize="96"
        fontWeight="800"
      >
        뭉
      </text>
      <path
        d="M418 140 a72 72 0 0 1 40 -30"
        className="fill-none stroke-canvas"
        strokeWidth="8"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}
