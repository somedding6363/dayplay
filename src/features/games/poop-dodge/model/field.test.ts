import { describe, expect, it } from "vitest";
import {
  FIELD_SIZE,
  PLAYER_SIZE,
  PLAYER_Y,
  fallSpeedAt,
  hitPoop,
  spawnIntervalAt,
  startField,
  stepField,
  type Field,
  type Move,
} from "./field";

function play(move: (field: Field) => Move, seconds: number, random = () => 0.5) {
  let field = startField();
  while (!hitPoop(field) && field.time < seconds) {
    field = stepField(field, move(field), random);
  }
  return field;
}

describe("field", () => {
  it("가만히 서 있으면 자기 자리로 떨어지는 똥에 몇 초 안에 맞는다", () => {
    const field = play(
      () => 0,
      30,
      () => 0.01,
    );
    expect(hitPoop(field)).toBeDefined();
    expect(field.time).toBeLessThan(6);
  });

  it("누르는 쪽으로 움직이고 판 밖으로 나가지 않는다", () => {
    const right = play(
      () => 1,
      5,
      () => 0.01,
    );
    expect(right.playerX).toBe(FIELD_SIZE - PLAYER_SIZE / 2);
    const left = play(
      () => -1,
      0.2,
      () => 0.99,
    );
    expect(left.playerX).toBeLessThan(FIELD_SIZE / 2);
  });

  it("떨어진 똥은 판을 벗어나면 사라지고, 멀리 떨어진 똥에는 맞지 않는다", () => {
    let field = play(
      () => 1,
      0,
      () => 0,
    );
    field = {
      ...field,
      playerX: 90,
      poops: [{ id: 0, x: 10, y: PLAYER_Y, speed: 50, acceleration: 0 }],
    };
    expect(hitPoop(field)).toBeUndefined();
    expect(hitPoop({ ...field, playerX: 10 })).toBeDefined();
    const later = stepField(
      { ...field, poops: [{ id: 0, x: 10, y: FIELD_SIZE + 3.9, speed: 50, acceleration: 0 }] },
      0,
    );
    expect(later.poops.some((poop) => poop.id === 0)).toBe(false);
  });

  it("똥마다 빠르기가 다르고, 일부는 떨어지면서 빨라진다", () => {
    let value = 0;
    const random = () => (value = (value + 0.37) % 1);
    let field = startField();
    while (field.poops.length < 6) field = stepField(field, 0, random);
    const speeds = new Set(field.poops.map((poop) => Math.round(poop.speed)));
    expect(speeds.size).toBeGreaterThan(3);
    const accelerating = field.poops.find((poop) => poop.acceleration > 0);
    expect(accelerating).toBeDefined();
    const later = stepField(field, 0, random);
    const same = later.poops.find((poop) => poop.id === accelerating?.id);
    expect(same && accelerating && same.speed).toBeGreaterThan(accelerating?.speed ?? Infinity);
  });

  it("시간이 지날수록 더 빠르고 자주 떨어진다", () => {
    expect(fallSpeedAt(30)).toBeGreaterThan(fallSpeedAt(0));
    expect(spawnIntervalAt(30)).toBeLessThan(spawnIntervalAt(0));
  });
});
