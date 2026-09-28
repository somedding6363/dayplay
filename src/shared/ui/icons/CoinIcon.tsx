import { useId, type ReactNode, type SVGProps } from "react";

interface CoinIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  side: "heads" | "tails";
}

// 도드라진 무늬. 어두운 음영을 깔고 위쪽에 밝은 윤곽을 살짝 어긋나게 겹쳐 금속에 찍힌 것처럼 보이게 한다.
function Embossed({ children }: { children: ReactNode }) {
  return (
    <>
      <g fill="white" fillOpacity="0.45" transform="translate(-0.5 -0.6)">
        {children}
      </g>
      <g fill="black" fillOpacity="0.26">
        {children}
      </g>
    </>
  );
}

// 금속 동전. 바탕은 currentColor이고, 광택과 음각은 흰색·검은색을 투명하게 겹쳐 만든다.
// 가운데에 "앞면" 또는 "뒷면"이 찍혀 있다.
export function CoinIcon({
  size = 96,
  side,
  "aria-hidden": ariaHidden = true,
  ...props
}: CoinIconProps) {
  const shine = useId();

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden={ariaHidden} {...props}>
      <defs>
        <linearGradient id={shine} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.55" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.05" />
          <stop offset="0.55" stopColor="black" stopOpacity="0.05" />
          <stop offset="1" stopColor="black" stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="49" fill="currentColor" />
      <circle cx="50" cy="50" r="49" fill={`url(#${shine})`} />
      {/* 테두리 안쪽의 솟은 고리 */}
      <circle
        cx="50"
        cy="50"
        r="45.5"
        fill="none"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="1.2"
      />
      <circle
        cx="50"
        cy="50.7"
        r="45.5"
        fill="none"
        stroke="black"
        strokeOpacity="0.22"
        strokeWidth="0.9"
      />

      <g fontFamily="inherit" fontSize="22" fontWeight="800" textAnchor="middle">
        <Embossed>
          <text x="50" y="58">
            {side === "heads" ? "앞면" : "뒷면"}
          </text>
        </Embossed>
      </g>
    </svg>
  );
}
