import { useId } from "react";

// 신호등처럼 켜지는 빛. 번져 나가는 빛의 고리가 반응의 순간을 보여준다.
export function Thumbnail() {
  const id = useId();
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className="text-game-soft" stopColor="currentColor" />
          <stop offset="1" className="text-game-mid" stopColor="currentColor" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" className="text-canvas" stopColor="currentColor" />
          <stop offset="0.25" className="text-game" stopColor="currentColor" />
          <stop offset="1" className="text-game" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-sky)`} />
      {/* 번져 나가는 빛의 고리 */}
      {[210, 160, 115].map((r, i) => (
        <circle
          key={r}
          cx="470"
          cy="170"
          r={r}
          className="fill-none stroke-game"
          strokeWidth={3 - i * 0.5}
          strokeOpacity={0.15 + i * 0.1}
        />
      ))}
      <circle cx="470" cy="170" r="150" fill={`url(#${id}-glow)`} opacity="0.55" />
      {/* 신호등 몸체 */}
      <rect x="425" y="60" width="90" height="230" rx="45" className="fill-game-ink" />
      <circle cx="470" cy="112" r="28" className="fill-game-mid" opacity="0.35" />
      <circle cx="470" cy="175" r="28" className="fill-game-mid" opacity="0.35" />
      <circle cx="470" cy="238" r="30" className="fill-game" />
      <circle cx="460" cy="228" r="10" className="fill-canvas" opacity="0.7" />
    </svg>
  );
}
