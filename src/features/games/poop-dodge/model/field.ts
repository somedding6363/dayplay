// 위에서 떨어지는 똥을 좌우로 피한다. 판은 FIELD_SIZE × FIELD_SIZE 정사각형 좌표로 계산한다.

export const FIELD_SIZE = 100;
// 사람과 똥의 크기(지름). 화면도 같은 값으로 그린다.
export const PLAYER_SIZE = 10;
export const POOP_SIZE = 8;
// 사람 발밑 높이
export const PLAYER_Y = FIELD_SIZE - PLAYER_SIZE / 2 - 2;
// 사람이 움직이는 속도(칸/초)
const PLAYER_SPEED = 75;
// 이 순서마다 한 번은 사람이 있는 자리로 떨어진다. 가만히 서 있으면 버틸 수 없다.
const AIMED_EVERY = 4;
// 두 원의 중심이 이보다 가까우면 맞은 것으로 본다. 그림보다 조금 작게 잡아 스친 것은 봐준다.
const HIT_DISTANCE = (PLAYER_SIZE + POOP_SIZE) / 2 - 2.5;
// 시뮬레이션 한 걸음(초). 화면 주사율과 상관없이 같은 입력이면 같은 결과가 나온다.
export const STEP_SECONDS = 1 / 120;

// 난이도 규칙은 시간에 따라서만 정해진다. 누구나 같은 시각에 같은 기준 빠르기와 빈도를 받고,
// 위치와 똥마다의 빠르기 배율·가속만 정해진 범위 안에서 무작위다(D-12).
export function fallSpeedAt(time: number) {
  return Math.min(130, 55 + 2 * time);
}

export function spawnIntervalAt(time: number) {
  return Math.max(0.1, 0.32 - 0.006 * time);
}

// 똥마다 기준 빠르기에 곱하는 배율. 느린 똥 사이로 빠른 똥이 끼어들어 박자를 읽기 어렵다.
const SPEED_RATIO_MIN = 0.6;
const SPEED_RATIO_MAX = 1.6;
// 이 순서마다 한 번은 떨어지면서 점점 빨라진다(초당 빠르기 증가).
const ACCELERATING_EVERY = 3;
const FALL_ACCELERATION = 160;

export type Move = -1 | 0 | 1;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface Poop {
  id: number;
  x: number;
  y: number;
  speed: number;
  // 초당 빠르기 증가. 0이면 같은 빠르기로 떨어진다.
  acceleration: number;
}

export interface Field {
  playerX: number;
  poops: Poop[];
  time: number;
  nextSpawnAt: number;
  nextId: number;
}

export function startField(): Field {
  return { playerX: FIELD_SIZE / 2, poops: [], time: 0, nextSpawnAt: 0.6, nextId: 0 };
}

export function stepField(field: Field, move: Move, random = Math.random, dt = STEP_SECONDS) {
  const time = field.time + dt;
  const playerX = clamp(
    field.playerX + move * PLAYER_SPEED * dt,
    PLAYER_SIZE / 2,
    FIELD_SIZE - PLAYER_SIZE / 2,
  );
  const poops = field.poops
    .map((poop) => {
      const speed = poop.speed + poop.acceleration * dt;
      return { ...poop, y: poop.y + speed * dt, speed };
    })
    .filter((poop) => poop.y - POOP_SIZE / 2 < FIELD_SIZE);
  let { nextSpawnAt, nextId } = field;
  while (nextSpawnAt <= time) {
    poops.push({
      id: nextId,
      x:
        nextId % AIMED_EVERY === AIMED_EVERY - 1
          ? clamp(playerX, POOP_SIZE / 2, FIELD_SIZE - POOP_SIZE / 2)
          : POOP_SIZE / 2 + random() * (FIELD_SIZE - POOP_SIZE),
      y: -POOP_SIZE / 2,
      speed:
        fallSpeedAt(nextSpawnAt) *
        (SPEED_RATIO_MIN + random() * (SPEED_RATIO_MAX - SPEED_RATIO_MIN)),
      acceleration: nextId % ACCELERATING_EVERY === 0 ? FALL_ACCELERATION : 0,
    });
    nextId += 1;
    nextSpawnAt += spawnIntervalAt(nextSpawnAt);
  }
  return { playerX, poops, time, nextSpawnAt, nextId };
}

// 사람에게 맞은 똥. 없으면 undefined
export function hitPoop({ playerX, poops }: Field) {
  return poops.find((poop) => Math.hypot(poop.x - playerX, poop.y - PLAYER_Y) < HIT_DISTANCE);
}
