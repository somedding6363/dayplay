import { describe, expect, it } from "vitest";
import {
  CEILING,
  HALF_WIDTH,
  KEEP_BEHIND,
  VIEW_DISTANCE,
  occupancyAt,
  hasCrashed,
  speedAt,
  startPlane,
  stepPlane,
  type Plane,
  type Steer,
} from "./flight";

const fly = (control: (plane: Plane) => [Steer, boolean], seconds: number, random = () => 0.5) => {
  let plane = startPlane(random);
  while (!hasCrashed(plane) && plane.time < seconds) {
    const [steer, lifting] = control(plane);
    plane = stepPlane(plane, steer, lifting, random);
  }
  return plane;
};

describe("flight", () => {
  it("아무것도 누르지 않으면 곧 땅에 떨어진다", () => {
    const plane = fly(() => [0, false], 10);
    expect(hasCrashed(plane)).toBe(true);
    expect(plane.time).toBeLessThan(2);
  });

  it("누르고 있으면 떠오르다 하늘 끝에서 멈추고, 좌우로 틀면 옆으로 간다", () => {
    let plane = startPlane(() => 0.5);
    for (let i = 0; i < 480; i += 1) plane = stepPlane(plane, 1, true, () => 0.5);
    expect(plane.y).toBe(CEILING);
    expect(plane.x).toBeGreaterThan(10);
    for (let i = 0; i < 600; i += 1) plane = stepPlane(plane, 1, true, () => 0.5);
    expect(plane.x).toBe(HALF_WIDTH);
  });

  it("건물은 보이는 거리 너머까지 채워지고, 비행기 뒤로 KEEP_BEHIND를 지나야 사라진다", () => {
    let plane = startPlane(() => 0.3);
    expect(Math.max(...plane.buildings.map((b) => b.z))).toBeGreaterThan(VIEW_DISTANCE - 30);
    for (let i = 0; i < 240; i += 1) plane = stepPlane(plane, 0, plane.y < 14, () => 0.3);
    expect(plane.buildings.every((b) => b.z + b.depth > plane.distance - KEEP_BEHIND)).toBe(true);
  });

  it("비행기가 뒤쪽을 지나친 건물은 KEEP_BEHIND 뒤에 지운다", () => {
    const plane = startPlane(() => 0.5);
    const passed = { id: 999, row: 0, x: 20, z: 0, width: 6, depth: 8, base: 0, height: 10 };
    const next = stepPlane({ ...plane, distance: 9, buildings: [passed] }, 0, true, () => 0.5);
    expect(next.buildings.some((b) => b.id === 999)).toBe(true);
    const gone = stepPlane(
      { ...plane, distance: 8 + KEEP_BEHIND + 1, buildings: [passed] },
      0,
      true,
    );
    expect(gone.buildings.some((b) => b.id === 999)).toBe(false);
  });

  it("건물끼리 겹치지 않고, 날 수 있는 폭 안에 선다", () => {
    let value = 0.13;
    const random = () => (value = (value * 9301 + 0.4927) % 1);
    let plane = startPlane(random);
    for (let i = 0; i < 1200; i += 1) plane = stepPlane(plane, 0, true, random);
    const { buildings } = plane;
    for (const a of buildings) {
      expect(a.x - a.width / 2).toBeGreaterThanOrEqual(-HALF_WIDTH);
      expect(a.x + a.width / 2).toBeLessThanOrEqual(HALF_WIDTH);
      for (const b of buildings) {
        if (a === b) continue;
        const overlapX = Math.abs(a.x - b.x) < (a.width + b.width) / 2;
        const overlapZ = a.z < b.z + b.depth && b.z < a.z + a.depth;
        expect(overlapX && overlapZ).toBe(false);
      }
    }
  });

  it("건물 앞면 높이 아래로 지나가면 부딪힌다", () => {
    const plane = startPlane(() => 0.5);
    const building = { id: 999, row: 0, x: 0, z: 10, width: 6, depth: 8, base: 0, height: 10 };
    const at = { ...plane, x: 0, y: 5, distance: 12, buildings: [building] };
    expect(hasCrashed(at)).toBe(true);
    expect(hasCrashed({ ...at, y: 11 })).toBe(false);
    expect(hasCrashed({ ...at, x: 6 })).toBe(false);
    expect(hasCrashed({ ...at, distance: 9 })).toBe(false);
  });

  it("공중 다리는 아래로 지나갈 수 있고, 다리 높이에서는 부딪힌다", () => {
    const plane = startPlane(() => 0.5);
    const bridge = { id: 999, row: 0, x: 0, z: 10, width: 10, depth: 5, base: 20, height: 25 };
    const at = { ...plane, x: 0, distance: 12, buildings: [bridge] };
    expect(hasCrashed({ ...at, y: 10 })).toBe(false);
    expect(hasCrashed({ ...at, y: 22 })).toBe(true);
    expect(hasCrashed({ ...at, y: 30 })).toBe(false);
  });

  it("공중 다리는 이웃한 두 건물 사이를 잇고 두 건물보다 낮다", () => {
    let value = 0.21;
    const random = () => (value = (value * 9301 + 0.4927) % 1);
    let plane = startPlane(random);
    for (let i = 0; i < 2400; i += 1) plane = stepPlane(plane, 0, true, random);
    const bridges = plane.buildings.filter((b) => b.base > 0);
    expect(bridges.length).toBeGreaterThan(0);
    for (const bridge of bridges) {
      const ends = plane.buildings.filter(
        (b) =>
          b.base === 0 &&
          b.row === bridge.row &&
          (Math.abs(b.x + b.width / 2 - (bridge.x - bridge.width / 2)) < 1e-9 ||
            Math.abs(b.x - b.width / 2 - (bridge.x + bridge.width / 2)) < 1e-9),
      );
      expect(ends).toHaveLength(2);
      for (const end of ends) expect(bridge.height).toBeLessThan(end.height);
    }
  });

  it("멀리 갈수록 빨라지고 건물이 촘촘해진다", () => {
    expect(speedAt(1000)).toBeGreaterThan(speedAt(0));
    expect(occupancyAt(1000)).toBeGreaterThan(occupancyAt(0));
  });
});
