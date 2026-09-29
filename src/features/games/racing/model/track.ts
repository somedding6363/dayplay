// 트랙과 차의 움직임. 화면과 상관없는 월드 좌표(WORLD_WIDTH × WORLD_HEIGHT)로 계산한다.
// 트랙은 모두에게 같다. 무작위 문제 대신 같은 코스를 얼마나 빨리 도는지로 겨룬다.

export const WORLD_WIDTH = 1000;
export const WORLD_HEIGHT = 700;
// 도로 가운데 선에서 도로 끝까지, 모래 끝(벽)까지의 거리
export const ROAD_HALF_WIDTH = 34;
export const WALL_DISTANCE = ROAD_HALF_WIDTH + 16;
export const LAPS = 3;

// 도로 가운데 선의 모양을 정하는 점(곡선이 점을 지나지는 않는다). 사용자가 준 참고 이미지의 코스 배치를 따라 좌표로 옮겼다(이미지는 쓰지 않는다).
// 아래 긴 직선의 출발선에서 왼쪽으로 출발해 시계 방향으로 돈다.
const controlPoints: [number, number][] = [
  [700, 615],
  [450, 615],
  [200, 615],
  [100, 555],
  [78, 475],
  [73, 428],
  [84, 377],
  [114, 294],
  [221, 247],
  [337, 310],
  [519, 85],
  [726, 31],
  [814, 151],
  [744, 282],
  [537, 258],
  [463, 383],
  [534, 500],
  [695, 484],
  [743, 380],
  [840, 351],
  [911, 383],
  [955, 458],
  [916, 609],
];
const SAMPLES_PER_SEGMENT = 60;
// 가운데 선 점 사이 거리
const SPACING = 4;

export interface Point {
  x: number;
  y: number;
}

// 닫힌 3차 B-spline으로 가운데 선을 만든다. 곡선과 접선, 곡률이 모두 이어져 꺾이는 곳이 없다.
// 곡률 반경이 벽까지의 거리보다 40 넘게 커서 굽이 안쪽 가장자리도 작은 화면에서 뾰족해 보이지 않고,
// 서로 다른 구간은 벽 두 개 폭보다 떨어져 있다(track.test.ts).
function sampleTrack(points: [number, number][]): Point[] {
  const count = points.length;
  const curve: Point[] = [];
  for (let i = 0; i < count; i += 1) {
    const [p0, p1, p2, p3] = [-1, 0, 1, 2].map((offset) => points[(i + offset + count) % count]);
    for (let s = 0; s < SAMPLES_PER_SEGMENT; s += 1) {
      const t = s / SAMPLES_PER_SEGMENT;
      const b0 = (1 - t) ** 3 / 6;
      const b1 = (3 * t ** 3 - 6 * t ** 2 + 4) / 6;
      const b2 = (-3 * t ** 3 + 3 * t ** 2 + 3 * t + 1) / 6;
      const b3 = t ** 3 / 6;
      const at = (axis: 0 | 1) => b0 * p0[axis] + b1 * p1[axis] + b2 * p2[axis] + b3 * p3[axis];
      curve.push({ x: at(0), y: at(1) });
    }
  }
  // 점 사이 거리를 고르게 다시 나눠 진행(progress)이 트랙 거리에 비례하게 한다.
  const lengths = [0];
  for (let i = 1; i <= curve.length; i += 1) {
    const a = curve[i - 1];
    const b = curve[i % curve.length];
    lengths.push(lengths[i - 1] + Math.hypot(b.x - a.x, b.y - a.y));
  }
  const total = lengths[curve.length];
  const sampleCount = Math.round(total / SPACING);
  const samples: Point[] = [];
  let j = 0;
  for (let k = 0; k < sampleCount; k += 1) {
    const distance = (k * total) / sampleCount;
    while (lengths[j + 1] < distance) j += 1;
    const t = (distance - lengths[j]) / (lengths[j + 1] - lengths[j]);
    const a = curve[j];
    const b = curve[(j + 1) % curve.length];
    samples.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return samples;
}

export const trackPoints = sampleTrack(controlPoints);
const N = trackPoints.length;

export const trackLength = trackPoints.reduce((total, point, index) => {
  const next = trackPoints[(index + 1) % N];
  return total + Math.hypot(next.x - point.x, next.y - point.y);
}, 0);

// 차의 성능. 속도는 월드 단위/초, 방향은 라디안/초
export const MAX_SPEED = 240;
const SAND_MAX_SPEED = 70;
const ACCELERATION = 200;
// 가는 방향과 반대로 누르면 이만큼 줄어든다.
const BRAKE = 360;
const REVERSE_MAX_SPEED = 60;
// 아무것도 누르지 않아도 이 속도로 달린다. 더 빠르면 서서히 이 속도로 준다.
const CRUISE_SPEED = 90;
const FRICTION = 60;
// 모래에서 SAND_MAX_SPEED보다 빠르면 이만큼 줄어든다.
const SAND_DRAG = 400;
const TURN_RATE = 2.2;
// 이 속도보다 느리면 덜 돈다. 멈춘 채로 제자리에서 돌 수 없다.
const FULL_TURN_SPEED = 80;
// 시뮬레이션 한 걸음(초). 화면 주사율과 상관없이 같은 입력이면 같은 결과가 나온다.
export const STEP_SECONDS = 1 / 120;

export type Surface = "road" | "sand";
export type Steer = -1 | 0 | 1;

export type Throttle = -1 | 0 | 1;

export interface CarInput {
  steer: Steer;
  // 1은 악셀, -1은 후진
  throttle: Throttle;
}

export interface Car {
  x: number;
  y: number;
  heading: number;
  speed: number;
  surface: Surface;
  // 가장 가까운 가운데 선 점
  index: number;
  // 출발선부터 가운데 선을 따라 나아간 점 수. 거꾸로 가면 준다. N이면 한 바퀴다.
  progress: number;
  // 벽에 막혀 나아가지 못하는 중
  blocked: boolean;
}

function closestOnSegment(point: Point, a: Point, b: Point): Point {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const t = Math.max(
    0,
    Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)),
  );
  return { x: a.x + t * dx, y: a.y + t * dy };
}

// 지난번 점(hint) 근처에서만 찾는다. 트랙의 다른 구간은 벽보다 멀어서 가까운 구간만 보면 된다.
const SEARCH_RANGE = 30;

// 가장 가까운 가운데 선 구간과 그 구간까지의 거리
export function locate(point: Point, hint: number) {
  let index = hint;
  let distance = Infinity;
  for (let offset = -SEARCH_RANGE; offset <= SEARCH_RANGE; offset += 1) {
    const i = (((hint + offset) % N) + N) % N;
    const candidate = closestOnSegment(point, trackPoints[i], trackPoints[(i + 1) % N]);
    const d = Math.hypot(point.x - candidate.x, point.y - candidate.y);
    if (d < distance) {
      distance = d;
      index = i;
    }
  }
  return { index, distance };
}

export function startCar(): Car {
  const [start, next] = trackPoints;
  return {
    x: start.x,
    y: start.y,
    heading: Math.atan2(next.y - start.y, next.x - start.x),
    speed: 0,
    surface: "road",
    index: 0,
    progress: 0,
    blocked: false,
  };
}

function nextSpeed(speed: number, throttle: Throttle, limit: number, dt: number) {
  if (throttle === 0) {
    if (speed < 0) {
      return Math.min(0, speed + BRAKE * dt);
    }
    if (speed > CRUISE_SPEED) {
      return Math.max(CRUISE_SPEED, speed - FRICTION * dt);
    }
    return Math.min(CRUISE_SPEED, limit, speed + ACCELERATION * dt);
  }
  // 앞으로 가는 중에 후진을 누르거나 뒤로 가는 중에 악셀을 누르면 먼저 선다.
  const change = speed * throttle < 0 ? BRAKE : ACCELERATION;
  return Math.max(-REVERSE_MAX_SPEED, Math.min(limit, speed + throttle * change * dt));
}

// 벽에 부딪혀도 끝나지 않는다.
export function stepCar(car: Car, { steer, throttle }: CarInput, dt = STEP_SECONDS): Car {
  const limit = car.surface === "sand" ? SAND_MAX_SPEED : MAX_SPEED;
  const speed =
    car.speed > limit
      ? Math.max(limit, car.speed - SAND_DRAG * dt)
      : nextSpeed(car.speed, throttle, limit, dt);
  // 후진할 때는 실제 차처럼 반대로 돈다. 느리면 덜 돈다.
  const turn = Math.min(1, Math.abs(speed) / FULL_TURN_SPEED) * Math.sign(speed);
  const heading = car.heading + steer * TURN_RATE * turn * dt;
  const x = car.x + Math.cos(heading) * speed * dt;
  const y = car.y + Math.sin(heading) * speed * dt;
  const { index, distance } = locate({ x, y }, car.index);
  // 벽에 막히면 그 자리에 선다. 속도와 방향은 그대로여서 조향해 벽에서 벗어나야 다시 나아간다.
  if (distance > WALL_DISTANCE) {
    return { ...car, heading, speed, blocked: true };
  }
  let delta = index - car.index;
  if (delta > N / 2) {
    delta -= N;
  } else if (delta < -N / 2) {
    delta += N;
  }
  return {
    x,
    y,
    heading,
    speed,
    surface: distance <= ROAD_HALF_WIDTH ? "road" : "sand",
    index,
    progress: car.progress + delta,
    blocked: false,
  };
}

export function lapsDone(car: Car) {
  return Math.floor(car.progress / N);
}

export function isFinished(car: Car) {
  return car.progress >= LAPS * N;
}
