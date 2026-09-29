import { useId } from "react";

// 해 질 녘 운동장. 두 기둥 사이 줄이 크게 휘어 도는 동안 공이 높이 떠 줄을 넘는다.
export function Thumbnail() {
  const id = useId();
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="text-game-mid" stopColor="currentColor" />
          <stop offset="1" className="text-game-soft" stopColor="currentColor" />
        </linearGradient>
        <radialGradient id={`${id}-ball`} cx="0.35" cy="0.3">
          <stop offset="0" className="text-canvas" stopColor="currentColor" />
          <stop offset="0.35" className="text-game" stopColor="currentColor" />
          <stop offset="1" className="text-game-ink" stopColor="currentColor" />
        </radialGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-sky)`} />
      {/* 땅 */}
      <path d="M0 330 L640 320 L640 450 L0 450Z" className="fill-game-ink" opacity="0.12" />
      {/* 줄이 지나온 자리(잔상) */}
      <path
        d="M330 170 Q 470 460 610 170"
        className="fill-none stroke-game-ink"
        strokeWidth="3"
        opacity="0.15"
      />
      <path
        d="M330 170 Q 470 380 610 170"
        className="fill-none stroke-game-ink"
        strokeWidth="3"
        opacity="0.25"
      />
      {/* 기둥 */}
      {[330, 610].map((x) => (
        <rect key={x} x={x - 7} y="165" width="14" height="165" rx="5" className="fill-game-ink" />
      ))}
      {/* 공 밑을 지나는 줄 */}
      <path
        d="M330 170 Q 470 330 610 170"
        className="fill-none stroke-game-ink"
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* 공과 그림자 */}
      <ellipse cx="470" cy="326" rx="30" ry="6" className="fill-game-ink" opacity="0.18" />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={450 + i * 20}
          y1={205}
          x2={450 + i * 20}
          y2={225}
          className="stroke-canvas"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}
      <circle cx="470" cy="160" r="38" fill={`url(#${id}-ball)`} />
    </svg>
  );
}
