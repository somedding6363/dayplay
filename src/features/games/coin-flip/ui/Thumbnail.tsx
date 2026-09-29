import { useId } from "react";

// 탁자 위로 높이 튀어 오르며 도는 동전. 도는 궤적과 탁자에 떨어진 그림자가 남는다.
export function Thumbnail() {
  const id = useId();
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="text-game-soft" stopColor="currentColor" />
          <stop offset="1" className="text-game-mid" stopColor="currentColor" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="text-canvas" stopColor="currentColor" />
          <stop offset="0.5" className="text-game-mid" stopColor="currentColor" />
          <stop offset="1" className="text-game" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-bg)`} />
      {/* 탁자 */}
      <path d="M0 360 L640 330 L640 450 L0 450Z" className="fill-game-ink" opacity="0.12" />
      <ellipse cx="480" cy="352" rx="60" ry="10" className="fill-game-ink" opacity="0.2" />
      {/* 튀어 오른 궤적 */}
      <path
        d="M470 340 C 440 250, 450 170, 480 130"
        className="fill-none stroke-game"
        strokeWidth="4"
        strokeDasharray="2 12"
        strokeLinecap="round"
        opacity="0.6"
      />
      {/* 도는 동안의 잔상 */}
      {[0.18, 0.35].map((opacity, i) => (
        <ellipse
          key={opacity}
          cx={478 - i * 6}
          cy={150 + i * 40}
          rx={62}
          ry={20 + i * 10}
          className="fill-game"
          opacity={opacity}
        />
      ))}
      {/* 동전. 비스듬히 누워 도는 중이라 옆면이 보인다. */}
      <g transform="rotate(-16 490 110)">
        <ellipse cx="490" cy="118" rx="80" ry="40" className="fill-game-ink" />
        <ellipse cx="490" cy="108" rx="80" ry="40" fill={`url(#${id}-metal)`} />
        <ellipse
          cx="490"
          cy="108"
          rx="62"
          ry="30"
          className="fill-none stroke-game-ink"
          strokeWidth="3"
          opacity="0.4"
        />
        <text
          x="490"
          y="118"
          textAnchor="middle"
          className="fill-game-ink"
          fontSize="30"
          fontWeight="800"
          transform="scale(1 0.55) translate(0 90)"
        >
          앞면
        </text>
      </g>
      {[
        [590, 70],
        [400, 80],
        [575, 175],
      ].map(([x, y]) => (
        <path
          key={x}
          d={`M${x} ${y - 12} v24 M${x - 12} ${y} h24`}
          className="stroke-canvas"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}
