import { useId } from "react";

// 해 질 녘 빌딩 숲 위를 가르는 종이비행기. 빌딩은 멀수록 흐리고, 비행기 뒤로 점선 궤적이 남는다.
export function Thumbnail() {
  const id = useId();
  // 겹겹이 선 빌딩 줄. 앞줄일수록 진하다. [x, 폭, 높이]
  const rows: { opacity: number; base: number; buildings: [number, number, number][] }[] = [
    {
      opacity: 0.25,
      base: 300,
      buildings: [
        [240, 40, 120],
        [290, 30, 170],
        [330, 50, 90],
        [390, 34, 200],
        [430, 46, 130],
        [490, 30, 180],
        [530, 44, 110],
        [580, 36, 160],
        [620, 40, 100],
      ],
    },
    {
      opacity: 0.5,
      base: 360,
      buildings: [
        [200, 60, 150],
        [270, 44, 210],
        [330, 70, 120],
        [420, 50, 240],
        [480, 64, 150],
        [560, 48, 200],
        [615, 60, 130],
      ],
    },
    {
      opacity: 0.85,
      base: 450,
      buildings: [
        [180, 80, 170],
        [270, 60, 250],
        [345, 90, 150],
        [455, 70, 290],
        [540, 90, 190],
      ],
    },
  ];
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="text-game-mid" stopColor="currentColor" />
          <stop offset="0.7" className="text-game-soft" stopColor="currentColor" />
          <stop offset="1" className="text-canvas" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-sky)`} />
      <circle cx="560" cy="120" r="46" className="fill-canvas" opacity="0.7" />
      {rows.map(({ opacity, base, buildings }) => (
        <g key={base} className="fill-game-ink" opacity={opacity}>
          {buildings.map(([x, width, height]) => (
            <g key={x}>
              <rect x={x} y={base - height} width={width} height={height} />
              {/* 창문 불빛 */}
              {Array.from({ length: Math.floor(height / 28) }, (_, row) => (
                <rect
                  key={row}
                  x={x + width * 0.25}
                  y={base - height + 12 + row * 28}
                  width={width * 0.5}
                  height="8"
                  className="fill-canvas"
                  opacity="0.35"
                />
              ))}
            </g>
          ))}
        </g>
      ))}
      {/* 궤적과 종이비행기 */}
      <path
        d="M180 230 C 280 180, 340 150, 440 110"
        className="fill-none stroke-canvas"
        strokeWidth="4"
        strokeDasharray="4 12"
        strokeLinecap="round"
      />
      <g transform="translate(470 100) rotate(-18)">
        <path d="M60 0 L-50 -30 L-20 0Z" className="fill-canvas" />
        <path d="M60 0 L-20 0 L-34 22Z" className="fill-game-mid" />
        <path
          d="M60 0 L-50 -30 L-20 0 L-34 22Z"
          className="fill-none stroke-game-ink"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
