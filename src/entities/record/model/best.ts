import type { Better } from "@/entities/game";

// 게임 방향에 따라 더 좋은 값이 이긴다. 무효(null)는 어떤 값보다 뒤다. 같으면 먼저 세운 기록을 남긴다.
export function isBetterValue(next: number | null, current: number | null, better: Better) {
  if (next === null) {
    return false;
  }
  if (current === null) {
    return true;
  }
  return better === "lower" ? next < current : next > current;
}
