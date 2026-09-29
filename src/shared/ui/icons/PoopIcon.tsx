import type { SVGProps } from "react";

interface PoopIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

// 세 층으로 쌓인 똥. 몸은 currentColor이고 음영·광택·눈은 흰색·검은색을 투명하게 겹쳐 만든다.
export function PoopIcon({ size = 48, "aria-hidden": ariaHidden = true, ...props }: PoopIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden={ariaHidden} {...props}>
      <g fill="currentColor">
        <path d="M24 3c3.5 1.6 5.5 4.2 5 7.4H18.6C18.2 7 20.6 4.8 24 3Z" />
        <rect x="14" y="9" width="20" height="12" rx="6" />
        <rect x="8.5" y="18.5" width="31" height="13" rx="6.5" />
        <rect x="3.5" y="29" width="41" height="15" rx="7.5" />
      </g>
      {/* 층 아래쪽 그림자 */}
      <g fill="black" fillOpacity="0.16">
        <rect x="14" y="17" width="20" height="4" rx="2" />
        <rect x="8.5" y="27.5" width="31" height="4" rx="2" />
        <rect x="3.5" y="39.5" width="41" height="4.5" rx="2.25" />
      </g>
      {/* 광택 */}
      <g fill="white" fillOpacity="0.4">
        <ellipse cx="19.5" cy="12.4" rx="3" ry="1.5" />
        <ellipse cx="14.5" cy="21.8" rx="3.6" ry="1.6" />
        <ellipse cx="10" cy="32.6" rx="4" ry="1.7" />
      </g>
      <g fill="white">
        <circle cx="19" cy="24.5" r="3.3" />
        <circle cx="29" cy="24.5" r="3.3" />
      </g>
      <g fill="black" fillOpacity="0.85">
        <circle cx="19.6" cy="25.1" r="1.7" />
        <circle cx="29.6" cy="25.1" r="1.7" />
      </g>
      <path
        d="M19.5 35c2.6 2.6 6.4 2.6 9 0"
        fill="none"
        stroke="black"
        strokeOpacity="0.7"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
