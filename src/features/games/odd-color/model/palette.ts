export interface LevelColors {
  base: string;
  odd: string;
}

// 단계마다 정해진 색. 같은 단계는 누구에게나 같은 색이고, 다른 칸의 위치만 무작위다.
// 색상(hue)은 단계마다 돌고, 다른 칸과의 밝기 차이는 단계가 오를수록 줄어 어려워진다.
export function levelColors(level: number): LevelColors {
  const hue = (level * 47) % 360;
  const saturation = 55;
  const lightness = 58;
  const gap = Math.max(4, 22 - (level - 1) * 1.5);
  return {
    base: `hsl(${hue} ${saturation}% ${lightness}%)`,
    odd: `hsl(${hue} ${saturation}% ${lightness + gap}%)`,
  };
}
