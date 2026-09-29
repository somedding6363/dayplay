import { useId } from "react";

// 시계 가운데에서 angle 방향으로 radius만큼 떨어진 점.
// 서버와 브라우저의 삼각함수 결과가 마지막 자릿수에서 달라 hydration이 어긋나지 않도록 반올림한다.
function onDial(angle: number, radius: number) {
  const round = (value: number) => Math.round(value * 100) / 100;
  return {
    x: round(470 + Math.cos(angle) * radius),
    y: round(200 + Math.sin(angle) * radius),
  };
}

// 기울어진 초시계. 바늘이 10초 바로 앞에서 멈춰 있고, 지나온 시간이 호로 남는다.
export function Thumbnail() {
  const id = useId();
  // 60초 중 9.8초 자리
  const angle = (9.8 / 60) * Math.PI * 2 - Math.PI / 2;
  const arcEnd = onDial(angle, 122);
  const hand = onDial(angle, 100);
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" className="text-game-soft" stopColor="currentColor" />
          <stop offset="1" className="text-game-mid" stopColor="currentColor" />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="0.4" cy="0.35">
          <stop offset="0" className="text-canvas" stopColor="currentColor" />
          <stop offset="1" className="text-game-soft" stopColor="currentColor" />
        </radialGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-bg)`} />
      {/* 흩어진 초 눈금 */}
      {Array.from({ length: 14 }, (_, i) => (
        <circle
          key={i}
          cx={60 + ((i * 97) % 560)}
          cy={40 + ((i * 53) % 150)}
          r={2 + (i % 3)}
          className="fill-game-ink"
          opacity="0.12"
        />
      ))}
      <g transform="rotate(-12 470 200)">
        {/* 그림자 */}
        <ellipse cx="480" cy="360" rx="120" ry="18" className="fill-game-ink" opacity="0.12" />
        {/* 용두와 버튼 */}
        <rect x="455" y="38" width="30" height="30" rx="6" className="fill-game-ink" />
        <rect x="440" y="28" width="60" height="16" rx="8" className="fill-game-ink" />
        <rect
          x="560"
          y="80"
          width="26"
          height="16"
          rx="6"
          className="fill-game-ink"
          transform="rotate(40 573 88)"
        />
        <circle cx="470" cy="200" r="140" className="fill-game-ink" />
        <circle cx="470" cy="200" r="122" fill={`url(#${id}-face)`} />
        {/* 지나온 시간 */}
        <path
          d={`M470 200 L470 78 A122 122 0 0 1 ${arcEnd.x} ${arcEnd.y} Z`}
          className="fill-game"
          opacity="0.35"
        />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const from = onDial(a, 104);
          const to = onDial(a, 116);
          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="stroke-game-ink"
              strokeWidth={i % 3 === 0 ? 5 : 2}
              strokeLinecap="round"
            />
          );
        })}
        <line
          x1="470"
          y1="200"
          x2={hand.x}
          y2={hand.y}
          className="stroke-game"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <circle cx="470" cy="200" r="11" className="fill-game-ink" />
        <text
          x="470"
          y="265"
          textAnchor="middle"
          className="fill-game-ink"
          fontSize="30"
          fontWeight="700"
        >
          9.8
        </text>
      </g>
    </svg>
  );
}
