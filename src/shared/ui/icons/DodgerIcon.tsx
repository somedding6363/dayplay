import type { SVGProps } from "react";

interface DodgerIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  // 맞았을 때는 눈을 질끈 감는다.
  hit?: boolean;
}

// 위를 올려다보는 동그란 캐릭터. 몸은 currentColor이고 얼굴은 흰색·검은색으로 그린다.
export function DodgerIcon({
  size = 48,
  hit = false,
  "aria-hidden": ariaHidden = true,
  ...props
}: DodgerIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden={ariaHidden} {...props}>
      <g fill="currentColor">
        <rect x="14" y="38" width="6" height="8" rx="3" />
        <rect x="28" y="38" width="6" height="8" rx="3" />
        <circle cx="24" cy="24" r="19" />
      </g>
      <ellipse cx="17" cy="14" rx="5" ry="3" fill="white" fillOpacity="0.28" />
      {hit ? (
        <path
          d="M13.5 16.5l5 3-5 3M34.5 16.5l-5 3 5 3"
          fill="none"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <>
          <g fill="white">
            <circle cx="17" cy="19" r="4.6" />
            <circle cx="31" cy="19" r="4.6" />
          </g>
          {/* 떨어지는 것을 보느라 눈동자가 위를 향한다. */}
          <g fill="black" fillOpacity="0.85">
            <circle cx="17" cy="17" r="2.2" />
            <circle cx="31" cy="17" r="2.2" />
          </g>
        </>
      )}
      <ellipse
        cx="24"
        cy="31"
        rx={hit ? 4 : 3}
        ry={hit ? 3.2 : 2.2}
        fill="black"
        fillOpacity="0.6"
      />
    </svg>
  );
}
