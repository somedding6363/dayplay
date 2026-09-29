import { useId } from "react";

// 기울어져 떠 있는 색 타일 격자. 한 칸만 빛을 받아 다른 색으로 떠오른다.
export function Thumbnail() {
  const id = useId();
  const size = 5;
  const odd = 13;
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="text-game-mid" stopColor="currentColor" />
          <stop offset="1" className="text-game-soft" stopColor="currentColor" />
        </linearGradient>
        <radialGradient id={`${id}-spot`}>
          <stop offset="0" className="text-canvas" stopColor="currentColor" stopOpacity="0.8" />
          <stop offset="1" className="text-canvas" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-bg)`} />
      <circle cx="470" cy="160" r="190" fill={`url(#${id}-spot)`} />
      {/* 비스듬히 누운 격자. 멀수록 흐리다. */}
      <g transform="translate(470 200) rotate(-18) skewX(-14) translate(-150 -150)">
        {Array.from({ length: size * size }, (_, i) => {
          const x = (i % size) * 62;
          const y = Math.floor(i / size) * 62;
          const isOdd = i === odd;
          return (
            <rect
              key={i}
              x={x}
              y={isOdd ? y - 14 : y}
              width="54"
              height="54"
              rx="10"
              className={isOdd ? "fill-canvas" : "fill-game"}
              opacity={isOdd ? 1 : 0.45 + (Math.floor(i / size) / size) * 0.55}
            />
          );
        })}
        {/* 떠오른 칸의 그림자와 윤곽 */}
        <rect
          x={(odd % size) * 62}
          y={Math.floor(odd / size) * 62 - 14}
          width="54"
          height="54"
          rx="10"
          className="fill-none stroke-game-ink"
          strokeWidth="4"
        />
      </g>
      {/* 반짝임 */}
      {[
        [560, 70, 10],
        [590, 110, 6],
        [395, 60, 7],
      ].map(([x, y, r]) => (
        <path
          key={x}
          d={`M${x} ${y - r * 2} L${x + r * 0.5} ${y - r * 0.5} L${x + r * 2} ${y} L${x + r * 0.5} ${y + r * 0.5} L${x} ${y + r * 2} L${x - r * 0.5} ${y + r * 0.5} L${x - r * 2} ${y} L${x - r * 0.5} ${y - r * 0.5}Z`}
          className="fill-canvas"
          opacity="0.9"
        />
      ))}
    </svg>
  );
}
