import { useId } from "react";

// 하늘로 한 칸씩 좌우로 꺾이며 이어지는 납작한 계단. 아래 계단은 크고 진하고, 위로 갈수록 작고 흐려진다.
// 동그란 캐릭터가 다음 계단으로 뛰어오르는 중이다.
export function Thumbnail() {
  const id = useId();
  // 아래(가까이)에서 위(멀리)로 이어지는 계단. 앞 칸보다 왼쪽(-1)이나 오른쪽(1)에 놓인다.
  const turns = [0, -1, -1, 1, 1, 1, -1, -1, 1, 1, -1];
  const steps: { x: number; y: number; scale: number }[] = [];
  let x = 470;
  let y = 400;
  let scale = 1;
  for (const turn of turns) {
    x += turn * 62 * scale;
    steps.push({ x, y, scale });
    y -= 44 * scale;
    scale *= 0.88;
  }
  // 캐릭터는 네 번째 계단에서 다섯 번째 계단으로 뛰는 중이다.
  const from = steps[3];
  const to = steps[4];
  const jumpX = (from.x + to.x) / 2;
  const jumpY = Math.min(from.y, to.y) - 60 * from.scale;
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="text-game-mid" stopColor="currentColor" />
          <stop offset="1" className="text-game-soft" stopColor="currentColor" />
        </linearGradient>
        <radialGradient id={`${id}-body`} cx="0.35" cy="0.3">
          <stop offset="0" className="text-canvas" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="0.4" className="text-game-ink" stopColor="currentColor" />
          <stop offset="1" className="text-game-ink" stopColor="currentColor" />
        </radialGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-sky)`} />
      {/* 구름 */}
      {[
        [560, 70, 80, 0.7],
        [360, 60, 56, 0.5],
        [620, 210, 50, 0.45],
        [300, 200, 44, 0.35],
      ].map(([cx, cy, r, opacity]) => (
        <g key={cx} className="fill-canvas" opacity={opacity}>
          <ellipse cx={cx} cy={cy} rx={r * 0.6} ry={r * 0.3} />
          <circle cx={cx - r * 0.15} cy={cy - r * 0.12} r={r * 0.26} />
          <circle cx={cx + r * 0.2} cy={cy - r * 0.08} r={r * 0.2} />
        </g>
      ))}
      {/* 먼 계단부터 그려 가까운 계단이 앞을 가린다. */}
      {steps
        .map((step, index) => ({ ...step, index }))
        .reverse()
        .map(({ x: sx, y: sy, scale: s, index }) => {
          // 게임 화면처럼 얇고 납작한 판이다.
          const width = 60 * s;
          const height = 10 * s;
          return (
            <rect
              key={index}
              x={sx - width / 2}
              y={sy - height}
              width={width}
              height={height}
              rx={height / 2}
              className="fill-game"
              opacity={0.3 + s * 0.7}
            />
          );
        })}
      {/* 점프 궤적과 캐릭터 */}
      <path
        d={`M${from.x} ${from.y - 12} Q ${jumpX} ${jumpY - 30} ${to.x} ${to.y - 12 * to.scale}`}
        className="fill-none stroke-canvas"
        strokeWidth="3"
        strokeDasharray="3 8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <g transform={`translate(${jumpX} ${jumpY})`}>
        <circle r={20 * from.scale} fill={`url(#${id}-body)`} />
        <circle cx={-7} cy={-4} r="5" className="fill-canvas" />
        <circle cx={7} cy={-4} r="5" className="fill-canvas" />
        <circle cx={-6} cy={-6} r="2.4" className="fill-game-ink" />
        <circle cx={8} cy={-6} r="2.4" className="fill-game-ink" />
      </g>
    </svg>
  );
}
