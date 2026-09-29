// 뒤에서 본 종이비행기가 앞으로 날아가며 다가오는 건물을 피한다.
// x는 좌우(가운데 0), y는 땅에서 위로, z는 앞으로 잰다. 단위는 m로 본다.

// 날 수 있는 좌우 폭과 높이
export const HALF_WIDTH = 45;
export const CEILING = 60;
// 비행기 크기의 절반(부딪힘 판정). 그림보다 조금 작게 잡아 스친 것은 봐준다.
const PLANE_HALF_WIDTH = 0.9;
const PLANE_HALF_HEIGHT = 0.3;
// 좌우로 트는 속도와, 누를 때·뗄 때의 오르내림(m/초, m/초²)
export const STEER_SPEED = 30;
const STEER_RESPONSE = 7;
const LIFT = 40;
const GRAVITY = 26;
export const MAX_CLIMB = 20;
const MAX_DIVE = 26;
// 건물 줄 사이 거리와, 보이는 거리
const ROW_SPACING = 20;
export const VIEW_DISTANCE = 200;
// 비행기 뒤로 이만큼은 건물을 남긴다. 뒤따라오는 카메라(비행기 뒤 5m)가 지나칠 때까지 보이게 한다.
export const KEEP_BEHIND = 8;
const FIRST_ROW = 70;
// 이웃한 줄의 빈 길이 이보다 멀리 옮겨 가지 않는다. 제때 옆으로 틀 수 있게 한다.
const MAX_LANE_SHIFT = 16;
const LANE_HALF_WIDTH = 4;
// 시뮬레이션 한 걸음(초). 화면 주사율과 상관없이 같은 입력이면 같은 결과가 나온다.
export const STEP_SECONDS = 1 / 120;

// 난이도는 날아간 거리로만 정해져 누구나 같은 순서로 어려워지고,
// 건물 위치·크기·높이만 정해진 범위 안에서 무작위다(D-12).
export function speedAt(distance: number) {
  return Math.min(MAX_SPEED, 34 + distance / 35);
}

// 한 줄의 자리마다 건물이 설 확률. 멀리 갈수록 빈틈이 줄어든다.
export function occupancyAt(distance: number) {
  return Math.min(0.9, 0.55 + distance / 3000);
}

// 이웃한 두 건물을 공중 다리로 이을 확률. 멀리 갈수록 높이 떠서 피하기 어려워진다.
export function bridgeChanceAt(distance: number) {
  return Math.min(0.7, 0.25 + distance / 2000);
}

// 공중 다리를 걸 수 있는 건물 높이, 다리 아래 높이의 범위, 두께, 깊이
const BRIDGE_MIN_TOWER = 20;
const BRIDGE_MIN_BASE = 12;
const BRIDGE_MAX_BASE = 40;
const BRIDGE_MIN_THICKNESS = 4;
const BRIDGE_MAX_THICKNESS = 6;
const BRIDGE_DEPTH = 5;

// 하늘 끝을 뚫는 고층 건물의 비율. 멀리 갈수록 위로 넘을 수 있는 건물이 줄어든다.
export function towerRatioAt(distance: number) {
  return Math.min(0.5, 0.2 + distance / 5000);
}

// 낮은 건물·중간 건물·고층 건물을 섞어 높이가 들쑥날쑥하다.
function buildingHeight(distance: number, random: () => number) {
  const kind = random();
  const size = random();
  if (kind < towerRatioAt(distance)) return CEILING + 5 + size * 40;
  if (kind < 0.6) return 3 + size * 12;
  return 15 + size * 35;
}

// 가장 빠른 속도. 결과 검증에 쓴다.
export const MAX_SPEED = 72;

export type Steer = -1 | 0 | 1;

export interface Building {
  id: number;
  // 몇 번째 줄인지. 줄끼리는 깊이가 겹치지 않아 그리는 순서를 정할 때 쓴다.
  row: number;
  // 가운데 x, 앞면 z, 폭, 깊이, 아래 높이(건물은 0, 공중 다리는 떠 있는 높이), 위 높이
  x: number;
  z: number;
  width: number;
  depth: number;
  base: number;
  height: number;
}

// 한 줄의 이웃한 두 건물이 모두 충분히 높으면 확률적으로 그 사이를 공중 다리로 잇는다.
// 다리는 두 건물 사이 틈(빈 길 포함)을 가로막아, 높이 떠 있으면 부딪히고 아래로 내려와야 지난다.
function addBridges(row: Building[], z: number, nextId: number, random: () => number) {
  const bridges: Building[] = [];
  const sorted = [...row].sort((a, b) => a.x - b.x);
  for (let i = 0; i + 1 < sorted.length; i += 1) {
    const a = sorted[i];
    const b = sorted[i + 1];
    if (Math.min(a.height, b.height) < BRIDGE_MIN_TOWER || random() >= bridgeChanceAt(z)) continue;
    // 두 건물의 깊이가 겹치는 구간 가운데에 놓는다.
    const from = Math.max(a.z, b.z);
    const to = Math.min(a.z + a.depth, b.z + b.depth);
    const depth = Math.min(BRIDGE_DEPTH, to - from);
    if (depth < 3) continue;
    const thickness =
      BRIDGE_MIN_THICKNESS + random() * (BRIDGE_MAX_THICKNESS - BRIDGE_MIN_THICKNESS);
    const top = Math.min(a.height, b.height) - 3;
    const maxBase = Math.min(BRIDGE_MAX_BASE, top - thickness);
    if (maxBase < BRIDGE_MIN_BASE) continue;
    const base = BRIDGE_MIN_BASE + random() * (maxBase - BRIDGE_MIN_BASE);
    const left = a.x + a.width / 2;
    const right = b.x - b.width / 2;
    bridges.push({
      id: nextId + bridges.length,
      row: a.row,
      x: (left + right) / 2,
      z: (from + to - depth) / 2,
      width: right - left,
      depth,
      base,
      height: base + thickness,
    });
  }
  return bridges;
}

export interface Plane {
  x: number;
  y: number;
  vx: number;
  vy: number;
  // 출발부터 날아간 거리. 비행기의 z다.
  distance: number;
  buildings: Building[];
  // 마지막으로 만든 줄의 z와 빈 길 가운데 x
  lastRowZ: number;
  laneX: number;
  nextId: number;
  time: number;
}

// 줄 안에서 앞면이 들쭉날쭉한 정도와 건물 깊이. 앞면 + 깊이가 다음 줄에 닿지 않아 줄끼리 겹치지 않는다.
const ROW_JITTER = 3;
const MIN_DEPTH = 6;
const MAX_DEPTH = ROW_SPACING - ROW_JITTER - 3;

// 왼쪽 끝부터 폭과 사이 간격을 무작위로 정해 자리를 나누고, 빈 길(laneX ± LANE_HALF_WIDTH)을 건너뛴다.
// 자리를 차례로 잡아서 한 줄의 건물끼리 겹치지 않는다.
function addRow(plane: Plane, random: () => number): Plane {
  const z = plane.lastRowZ + ROW_SPACING;
  const lane = Math.max(
    -HALF_WIDTH + LANE_HALF_WIDTH,
    Math.min(HALF_WIDTH - LANE_HALF_WIDTH, plane.laneX + (random() * 2 - 1) * MAX_LANE_SHIFT),
  );
  const row: Building[] = [];
  let nextId = plane.nextId;
  const occupancy = occupancyAt(z);
  let left = -HALF_WIDTH + random() * 3;
  while (left < HALF_WIDTH) {
    const width = 4 + random() * 12;
    const right = left + width;
    if (right > HALF_WIDTH) break;
    if (right > lane - LANE_HALF_WIDTH && left < lane + LANE_HALF_WIDTH) {
      left = lane + LANE_HALF_WIDTH + 1 + random() * 2;
      continue;
    }
    if (random() < occupancy) {
      row.push({
        id: nextId,
        row: Math.round(z / ROW_SPACING),
        x: left + width / 2,
        z: z + random() * ROW_JITTER,
        width,
        depth: MIN_DEPTH + random() * (MAX_DEPTH - MIN_DEPTH),
        base: 0,
        height: buildingHeight(z, random),
      });
      nextId += 1;
    }
    left = right + 1 + random() * 3;
  }
  const bridges = addBridges(row, z, nextId, random);
  nextId += bridges.length;
  const buildings = [...plane.buildings, ...row, ...bridges];
  return { ...plane, buildings, lastRowZ: z, laneX: lane, nextId };
}

function fillRows(plane: Plane, random: () => number) {
  let next = {
    ...plane,
    buildings: plane.buildings.filter((b) => b.z + b.depth > plane.distance - KEEP_BEHIND),
  };
  while (next.lastRowZ < plane.distance + VIEW_DISTANCE) next = addRow(next, random);
  return next;
}

export function startPlane(random = Math.random): Plane {
  return fillRows(
    {
      x: 0,
      y: 14,
      vx: 0,
      vy: 0,
      distance: 0,
      buildings: [],
      lastRowZ: FIRST_ROW - ROW_SPACING,
      laneX: 0,
      nextId: 0,
      time: 0,
    },
    random,
  );
}

export function stepPlane(
  plane: Plane,
  steer: Steer,
  lifting: boolean,
  random = Math.random,
  dt = STEP_SECONDS,
): Plane {
  // 옆으로는 바로 방향을 바꾸지 않고 조금 미끄러지듯 따라간다.
  const vx = plane.vx + (steer * STEER_SPEED - plane.vx) * Math.min(1, STEER_RESPONSE * dt);
  const x = Math.max(-HALF_WIDTH, Math.min(HALF_WIDTH, plane.x + vx * dt));
  let vy = Math.max(-MAX_DIVE, Math.min(MAX_CLIMB, plane.vy + (lifting ? LIFT : -GRAVITY) * dt));
  let y = plane.y + vy * dt;
  // 하늘 끝에 닿으면 더 오르지 못할 뿐 끝나지는 않는다.
  if (y > CEILING) {
    y = CEILING;
    vy = Math.min(0, vy);
  }
  const distance = plane.distance + speedAt(plane.distance) * dt;
  return fillRows({ ...plane, x, y, vx, vy, distance, time: plane.time + dt }, random);
}

// 땅에 닿거나 건물·공중 다리에 부딪혔는지
export function hasCrashed({ x, y, distance, buildings }: Plane) {
  if (y - PLANE_HALF_HEIGHT <= 0) return true;
  return buildings.some(
    (building) =>
      distance >= building.z &&
      distance <= building.z + building.depth &&
      Math.abs(x - building.x) < building.width / 2 + PLANE_HALF_WIDTH &&
      y - PLANE_HALF_HEIGHT < building.height &&
      y + PLANE_HALF_HEIGHT > building.base,
  );
}
