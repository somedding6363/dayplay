// 양쪽 기둥에서 도는 긴 줄을 가운데의 공이 뛰어넘는다.
// 줄의 위치는 바퀴 수(phase)로 잰다. 정수면 줄이 맨 위, 정수 + 0.5면 발밑을 지난다.
// 줄은 위에서 공 앞(화면 쪽)으로 내려와 공 밑을 지나 뒤로 올라간다.

// 점프 한 번에 떠 있는 시간(초)과, 줄이 발밑을 지날 때 발이 이보다 높아야 넘는다(점프 최고 높이에 대한 비율).
// 0.6이면 점프의 가운데 약 63% 구간(약 0.27초) 안에 줄이 지나가야 한다.
export const JUMP_SECONDS = 0.42;
export const CLEARANCE = 0.6;
// 시작할 때 줄은 발밑을 막 지나 뒤로 올라가는 중이다. 첫 줄이 발밑에 오기까지 약 1.2초가 있다.
const START_PHASE = -0.4;
// 시뮬레이션 한 걸음(초). 화면 주사율과 상관없이 같은 입력이면 같은 결과가 나온다.
export const STEP_SECONDS = 1 / 240;

// 넘을수록 빨라진다(바퀴/초).
export function baseSpeedAt(jumps: number) {
  return Math.min(MAX_SPEED, 0.9 + jumps * 0.03);
}

// 가장 빠른 속도(바퀴/초). 불규칙하게 빨라지는 바퀴까지 포함한다. 결과 검증에 쓴다.
export const MAX_SPEED = 2.1;
// 네 바퀴에 한 번꼴로 그 바퀴만 빠르거나 느리게 돈다.
const IRREGULAR_CHANCE = 0.25;
const IRREGULAR_AMOUNT = 0.18;

// 한 바퀴를 도는 속도. 기준 속도는 넘은 횟수로만 정해져 누구나 같고,
// 어느 바퀴가 빠르거나 느려질지만 play마다 무작위다(D-12).
export function revolutionSpeed(jumps: number, random: () => number) {
  const base = baseSpeedAt(jumps);
  if (random() >= IRREGULAR_CHANCE) return base;
  const change = random() < 0.5 ? -IRREGULAR_AMOUNT : IRREGULAR_AMOUNT;
  return Math.min(MAX_SPEED, base * (1 + change));
}

export interface Rope {
  phase: number;
  // 이번 바퀴의 속도(바퀴/초)
  speed: number;
  // 점프를 시작한 시각(초). 땅에 있으면 null
  jumpedAt: number | null;
  jumps: number;
  time: number;
  // 줄에 걸렸는지
  caught: boolean;
}

export function startRope(random = Math.random): Rope {
  return {
    phase: START_PHASE,
    speed: revolutionSpeed(0, random),
    jumpedAt: null,
    jumps: 0,
    time: 0,
    caught: false,
  };
}

// 점프 높이(최고 높이에 대한 비율, 0~1). 포물선으로 올라갔다 내려온다.
export function jumpHeight(rope: Pick<Rope, "jumpedAt" | "time">) {
  if (rope.jumpedAt === null) return 0;
  const t = (rope.time - rope.jumpedAt) / JUMP_SECONDS;
  return t <= 0 || t >= 1 ? 0 : 4 * t * (1 - t);
}

// 땅에 있을 때만 뛸 수 있다. 공중에서 다시 누르면 무시한다.
export function jump(rope: Rope): Rope {
  return rope.jumpedAt === null ? { ...rope, jumpedAt: rope.time } : rope;
}

export function stepRope(rope: Rope, random = Math.random, dt = STEP_SECONDS): Rope {
  const time = rope.time + dt;
  const phase = rope.phase + rope.speed * dt;
  let { speed, jumps, jumpedAt } = rope;
  if (jumpedAt !== null && time - jumpedAt >= JUMP_SECONDS) jumpedAt = null;
  let caught = rope.caught;
  // 줄이 발밑(정수 + 0.5)을 지났다. 발이 충분히 떠 있으면 넘는다.
  if (Math.floor(rope.phase - 0.5) < Math.floor(phase - 0.5)) {
    if (jumpHeight({ jumpedAt, time }) > CLEARANCE) {
      jumps += 1;
    } else {
      caught = true;
    }
  }
  // 줄이 맨 위(정수)를 지나면 다음 바퀴의 속도를 정한다.
  if (Math.floor(rope.phase) < Math.floor(phase)) speed = revolutionSpeed(jumps, random);
  return { phase, speed, jumpedAt, jumps, time, caught };
}
