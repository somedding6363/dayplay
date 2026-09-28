export type Direction = -1 | 1;
export type StairAction = "climb" | "turn";

// 방향이 바뀔 확률. 계단은 play마다 무작위로 만든다(D-12).
const TURN_CHANCE = 0.4;

// 계단 i칸째가 앞 칸에서 어느 쪽에 있는지. 0번 칸은 출발 자리라 방향이 없다.
export function extendStairs(directions: Direction[], count: number, random = Math.random) {
  const next = [...directions];
  while (next.length < count) {
    const previous = next.at(-1) ?? 1;
    next.push(random() < TURN_CHANCE ? (previous === 1 ? -1 : 1) : previous);
  }
  return next;
}

// 오르기는 보고 있는 방향으로, 방향 전환은 반대로 돌아서 한 칸 오른다.
export function facingAfter(facing: Direction, action: StairAction): Direction {
  if (action === "climb") {
    return facing;
  }
  return facing === 1 ? -1 : 1;
}
