import { useId } from "react";

// 위에서 내려다본 굽은 트랙. 차가 모래 가장자리를 스치며 코너를 빠져나가고 뒤로 속도선이 남는다.
export function Thumbnail() {
  const id = useId();
  const track = "M250 500 C 300 330, 360 250, 470 230 S 640 150, 700 40";
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="text-game-soft" stopColor="currentColor" />
          <stop offset="1" className="text-game-mid" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-ground)`} />
      {/* 벽, 모래, 도로 순으로 겹친다. */}
      <path
        d={track}
        className="fill-none stroke-game-ink"
        strokeWidth="130"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d={track}
        className="fill-none stroke-game-mid"
        strokeWidth="122"
        strokeLinecap="round"
      />
      <path d={track} className="fill-none stroke-canvas" strokeWidth="80" strokeLinecap="round" />
      <path
        d={track}
        className="fill-none stroke-game-ink"
        strokeWidth="3"
        strokeDasharray="18 16"
        opacity="0.35"
      />
      {/* 출발선. 트랙 곡선(t = 0.4, 진행 방향 약 -58°)에 수직으로 도로 폭(80)을 가로지르는 두 줄 체크무늬 */}
      <g transform="translate(317 337) rotate(-58)">
        {Array.from({ length: 16 }, (_, i) => {
          const column = i % 2;
          const row = Math.floor(i / 2);
          return (
            <rect
              key={i}
              x={-10 + column * 10}
              y={-40 + row * 10}
              width="10"
              height="10"
              className={(column + row) % 2 === 0 ? "fill-game-ink" : "fill-canvas"}
            />
          );
        })}
      </g>
      {/* 속도선 */}
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={395 - i * 6}
          y1={268 + i * 12}
          x2={445 - i * 4}
          y2={236 + i * 12}
          className="stroke-game"
          strokeWidth="4"
          strokeLinecap="round"
          opacity={0.7 - i * 0.2}
        />
      ))}
      {/* 차 */}
      <g transform="translate(478 222) rotate(-28)">
        <ellipse cx="2" cy="6" rx="30" ry="12" className="fill-game-ink" opacity="0.2" />
        <rect x="-28" y="-14" width="56" height="28" rx="8" className="fill-game" />
        <rect
          x="-26"
          y="-14"
          width="52"
          height="28"
          rx="8"
          className="fill-none stroke-game-ink"
          strokeWidth="3"
        />
        <rect x="6" y="-10" width="12" height="20" rx="3" className="fill-game-ink" opacity="0.8" />
        <rect x="-20" y="-3" width="20" height="6" rx="3" className="fill-canvas" opacity="0.7" />
      </g>
    </svg>
  );
}
