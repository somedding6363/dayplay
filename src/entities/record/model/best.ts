// 점수가 높을수록 좋고, 무효(null)는 어떤 점수보다 뒤다. 같으면 먼저 세운 기록을 남긴다.
export function isBetterScore(next: number | null, current: number | null) {
  return next !== null && (current === null || next > current);
}
