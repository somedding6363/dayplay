import { describe, expect, it } from "vitest";
import {
  LAPS,
  MAX_SPEED,
  STEP_SECONDS,
  WALL_DISTANCE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  isFinished,
  lapsDone,
  locate,
  startCar,
  stepCar,
  trackPoints,
  type Car,
  type CarInput,
} from "./track";

const N = trackPoints.length;
const at = (index: number) => trackPoints[((index % N) + N) % N];

// 앞쪽 가운데 선을 따라가는 간단한 운전. 트랙을 완주할 수 있는지 확인한다.
function autopilot(car: Car): CarInput {
  const target = at(car.index + 16);
  let diff = Math.atan2(target.y - car.y, target.x - car.x) - car.heading;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  const [a, b, c] = [5, 25, 45].map((offset) => at(car.index + offset));
  let turn = Math.abs(Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(b.y - a.y, b.x - a.x));
  turn = Math.min(turn, 2 * Math.PI - turn);
  return {
    steer: diff > 0.03 ? 1 : diff < -0.03 ? -1 : 0,
    throttle: car.speed > MAX_SPEED * (1 - turn * 0.3) ? -1 : 1,
  };
}

// 세 점을 지나는 원의 반지름
function radius(a: { x: number; y: number }, b: typeof a, c: typeof a) {
  const ab = Math.hypot(b.x - a.x, b.y - a.y);
  const bc = Math.hypot(c.x - b.x, c.y - b.y);
  const ca = Math.hypot(a.x - c.x, a.y - c.y);
  const cross = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
  return (ab * bc * ca) / (2 * cross);
}

const drive = (car: Car, input: CarInput, steps: number) => {
  let next = car;
  for (let i = 0; i < steps; i += 1) next = stepCar(next, input);
  return next;
};

describe("track", () => {
  it("서로 다른 구간이 벽을 사이에 두고 떨어져 있고 월드 안에 있다", () => {
    let closest = Infinity;
    for (let i = 0; i < N; i += 1) {
      const p = trackPoints[i];
      expect(p.x - WALL_DISTANCE).toBeGreaterThan(0);
      expect(p.x + WALL_DISTANCE).toBeLessThan(WORLD_WIDTH);
      expect(p.y - WALL_DISTANCE).toBeGreaterThan(0);
      expect(p.y + WALL_DISTANCE).toBeLessThan(WORLD_HEIGHT);
      for (let j = 0; j < N; j += 1) {
        if (Math.min(Math.abs(i - j), N - Math.abs(i - j)) < 60) continue;
        const q = trackPoints[j];
        closest = Math.min(closest, Math.hypot(p.x - q.x, p.y - q.y));
      }
    }
    expect(closest).toBeGreaterThan(WALL_DISTANCE * 2);
  });

  it("꺾이는 곳 없이 부드럽고, 곡률 반경이 벽까지의 거리보다 커서 가장자리도 꺾이지 않는다", () => {
    let smallest = Infinity;
    let sharpest = 0;
    for (let i = 0; i < N; i += 1) {
      smallest = Math.min(smallest, radius(at(i - 3), at(i), at(i + 3)));
      const before = Math.atan2(at(i).y - at(i - 1).y, at(i).x - at(i - 1).x);
      const after = Math.atan2(at(i + 1).y - at(i).y, at(i + 1).x - at(i).x);
      const bend = Math.abs(Math.atan2(Math.sin(after - before), Math.cos(after - before)));
      sharpest = Math.max(sharpest, bend);
    }
    // 굽이 안쪽 벽의 반경(곡률 반경 - 벽까지의 거리)이 작으면 작은 화면에서 뾰족하게 보인다.
    expect(smallest - WALL_DISTANCE).toBeGreaterThan(40);
    expect(sharpest).toBeLessThan(0.15);
  });

  it("누르지 않아도 기본 속도로 달리고, 악셀은 더 빠르게, 후진은 서서 뒤로 가게 한다", () => {
    const idle = drive(startCar(), { steer: 0, throttle: 0 }, 120);
    expect(idle.speed).toBeGreaterThan(0);
    expect(idle.progress).toBeGreaterThan(0);

    const accelerated = drive(idle, { steer: 0, throttle: 1 }, 60);
    expect(accelerated.speed).toBeGreaterThan(idle.speed);
    expect(drive(accelerated, { steer: 0, throttle: 0 }, 60).speed).toBeLessThan(accelerated.speed);

    const reversing = drive(startCar(), { steer: 0, throttle: -1 }, 60);
    expect(reversing.speed).toBeLessThan(0);
    expect(reversing.progress).toBeLessThan(0);
  });

  it("벽에 막히면 속도는 남은 채 멈추고, 조향해 벽에서 벗어나면 다시 나아간다", () => {
    let car = startCar();
    while (!car.blocked) car = stepCar(car, { steer: 1, throttle: 1 });
    const stuck = stepCar(car, { steer: 1, throttle: 1 });
    expect(stuck.blocked).toBe(true);
    expect([stuck.x, stuck.y]).toEqual([car.x, car.y]);
    expect(stuck.speed).toBeGreaterThan(0);
    expect(locate(stuck, stuck.index).distance).toBeLessThanOrEqual(WALL_DISTANCE);

    let freed = stuck;
    for (let i = 0; i < 240 && freed.blocked; i += 1) {
      freed = stepCar(freed, { steer: -1, throttle: 1 });
    }
    expect(freed.blocked).toBe(false);
    expect(Math.hypot(freed.x - stuck.x, freed.y - stuck.y)).toBeGreaterThan(0);
  });

  it("모래에서는 느려진다", () => {
    const onRoad = { ...startCar(), speed: 150 };
    const onSand = { ...onRoad, surface: "sand" as const };
    expect(stepCar(onRoad, { steer: 0, throttle: 1 }).speed).toBeGreaterThan(150);
    expect(stepCar(onSand, { steer: 0, throttle: 1 }).speed).toBeLessThan(150);
  });

  it("세 바퀴를 돌면 끝난다", () => {
    let car = startCar();
    let laps = 0;
    for (let t = 0; t < 180 && !isFinished(car); t += STEP_SECONDS) {
      car = stepCar(car, autopilot(car));
      laps = Math.max(laps, lapsDone(car));
    }
    expect(isFinished(car)).toBe(true);
    expect(laps).toBe(LAPS);
  });
});
