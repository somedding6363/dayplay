import { useId } from "react";
import { DodgerIcon, PoopIcon } from "@/shared/ui/icons";

// 하늘에서 쏟아지는 똥 사이를 올려다보며 피하는 캐릭터. 멀리 있는 똥은 작고 흐리다.
export function Thumbnail() {
  const id = useId();
  // [x, y, 크기, 흐림]
  const poops: [number, number, number, number][] = [
    [360, 40, 34, 0.35],
    [450, 90, 48, 0.6],
    [560, 30, 40, 0.45],
    [610, 150, 30, 0.35],
    [520, 170, 64, 1],
    [400, 190, 38, 0.5],
    [300, 110, 28, 0.3],
  ];
  return (
    <svg viewBox="0 0 640 450" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className="text-game-mid" stopColor="currentColor" />
          <stop offset="1" className="text-game-soft" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <rect width="640" height="450" fill={`url(#${id}-sky)`} />
      {poops.map(([x, y, size, opacity]) => (
        <PoopIcon
          key={x}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          className="text-game"
          opacity={opacity}
        />
      ))}
      {/* 땅과 캐릭터 */}
      <path
        d="M0 400 Q 320 370 640 395 L640 450 L0 450Z"
        className="fill-game-ink"
        opacity="0.15"
      />
      <ellipse cx="470" cy="392" rx="40" ry="7" className="fill-game-ink" opacity="0.25" />
      <DodgerIcon x={432} y={318} width={76} height={76} className="text-ink" />
    </svg>
  );
}
