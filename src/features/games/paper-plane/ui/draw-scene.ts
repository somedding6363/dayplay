import {
  HALF_WIDTH,
  MAX_CLIMB,
  STEER_SPEED,
  VIEW_DISTANCE,
  type Building,
  type Plane,
} from "../model/flight";

// 카메라는 비행기 뒤 위쪽에 붙어 따라간다.
const CAMERA_BACK = 5;
// 비행기와 거의 같은 높이에서 봐야 날개가 V자로 펼쳐진 뒷모습이 보인다.
const CAMERA_UP = 0.9;
// 카메라 바로 앞의 자르는 면. 이보다 가까운 부분은 그리지 않는다.
const NEAR = 0.5;
// 이 거리부터 건물 색이 하늘색으로 섞여 멀리 있는 건물이 흐려 보인다(투명도가 아니라 색을 섞어 불투명하다).
const FOG_START = 90;
// 보이는 거리 끝에서 하늘색이 섞이는 비율
const FOG_MAX = 0.85;
const GROUND_LINE_SPACING = 10;

// 실제 건물처럼 보이는 외벽 색. 앞면은 이 색, 옆면은 어둡게, 윗면은 밝게 칠한다.
const FACADES = [
  "#b9b6ae", // 콘크리트
  "#d9cdb4", // 베이지
  "#a8634d", // 벽돌
  "#56626d", // 짙은 유리
  "#e4ded2", // 크림
  "#7d8690", // 회색 패널
  "#c7a98a", // 사암
];

const WINDOW_DARKEN = 0.45;
const SIDE_DARKEN = 0.3;
const TOP_LIGHTEN = 0.15;
const BOTTOM_DARKEN = 0.5;

type Rgb = [number, number, number];
type Vec3 = [number, number, number];

function parseHex(hex: string): Rgb {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? [...value].map((c) => c + c).join("") : value;
  const channel = (index: number) => parseInt(full.slice(index, index + 2), 16);
  return [channel(0), channel(2), channel(4)];
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

const toCss = ([r, g, b]: Rgb) => `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)})`;
const BLACK: Rgb = [0, 0, 0];
const WHITE: Rgb = [255, 255, 255];
const FALLBACK_SKY: Rgb = [226, 238, 244];
const facadeColors = FACADES.map(parseHex);
const GROUND = parseHex("#c4c1b8");
const GROUND_LINE = parseHex("#8f8c85");

export interface SceneColors {
  sky: Rgb;
}

// 하늘은 게임 색(--game-soft)을 쓴다. Tailwind는 --color-game-* 를 class에만 풀어 써서 computed style에 없다.
export function readSceneColors(element: Element): SceneColors {
  const sky = getComputedStyle(element).getPropertyValue("--game-soft").trim();
  return { sky: sky.startsWith("#") ? parseHex(sky) : FALLBACK_SKY };
}

interface Camera {
  x: number;
  y: number;
  z: number;
  focal: number;
  centerX: number;
  horizonY: number;
}

function project(camera: Camera, x: number, y: number, z: number) {
  const depth = Math.max(NEAR, z - camera.z);
  return {
    x: camera.centerX + ((x - camera.x) * camera.focal) / depth,
    y: camera.horizonY - ((y - camera.y) * camera.focal) / depth,
  };
}

function fillPolygon(
  context: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
) {
  context.beginPath();
  points.forEach(({ x, y }, index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
  context.closePath();
  context.fillStyle = color;
  context.fill();
}

function drawBuilding(
  context: CanvasRenderingContext2D,
  camera: Camera,
  building: Building,
  colors: SceneColors,
) {
  const clip = camera.z + NEAR;
  const far = building.z + building.depth;
  if (far <= clip) return;
  // 카메라가 앞면을 지나쳤으면 옆면·윗면을 카메라 앞에서 자르고, 앞면은 그리지 않는다.
  const frontVisible = building.z >= clip;
  const near = frontVisible ? building.z : clip;
  const left = building.x - building.width / 2;
  const right = building.x + building.width / 2;
  // 건물은 땅(bottom 0)부터, 공중 다리는 떠 있는 높이부터 선다.
  const { height, base: bottom } = building;
  const at = (x: number, y: number, z: number) => project(camera, x, y, z);

  const fog = Math.min(1, Math.max(0, (near - camera.z - FOG_START) / (VIEW_DISTANCE - FOG_START)));
  const base = mix(facadeColors[building.id % facadeColors.length], colors.sky, fog * FOG_MAX);

  // 카메라 쪽을 향한 옆면·윗면·아랫면만 보인다. 반대쪽 면은 앞쪽 면에 가려 그리지 않는다.
  const sideX = camera.x < left ? left : camera.x > right ? right : null;
  if (sideX !== null) {
    fillPolygon(
      context,
      [
        at(sideX, bottom, near),
        at(sideX, height, near),
        at(sideX, height, far),
        at(sideX, bottom, far),
      ],
      toCss(mix(base, BLACK, SIDE_DARKEN)),
    );
  }
  // 공중 다리 아래로 지나갈 때 보이는 아랫면. 그늘이라 가장 어둡다.
  if (camera.y < bottom) {
    fillPolygon(
      context,
      [
        at(left, bottom, near),
        at(right, bottom, near),
        at(right, bottom, far),
        at(left, bottom, far),
      ],
      toCss(mix(base, BLACK, BOTTOM_DARKEN)),
    );
  }
  if (camera.y > height) {
    fillPolygon(
      context,
      [
        at(left, height, near),
        at(right, height, near),
        at(right, height, far),
        at(left, height, far),
      ],
      toCss(mix(base, WHITE, TOP_LIGHTEN)),
    );
  }
  if (!frontVisible) return;

  const topLeft = at(left, height, near);
  const bottomRight = at(right, bottom, near);
  const width = bottomRight.x - topLeft.x;
  const faceHeight = bottomRight.y - topLeft.y;
  context.fillStyle = toCss(base);
  context.fillRect(topLeft.x, topLeft.y, width, faceHeight);

  // 창문. 층(3m)마다 한 줄, 폭 3m마다 한 칸. 충분히 크게 보일 때만 그려 렉을 줄인다.
  const rows = Math.max(1, Math.floor((height - bottom) / 3));
  const columns = Math.max(1, Math.floor(building.width / 3));
  const cellWidth = width / columns;
  const cellHeight = faceHeight / rows;
  if (cellWidth < 5 || cellHeight < 5) return;
  context.fillStyle = toCss(mix(base, BLACK, WINDOW_DARKEN));
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      context.fillRect(
        topLeft.x + cellWidth * (column + 0.25),
        topLeft.y + cellHeight * (row + 0.25),
        cellWidth * 0.5,
        cellHeight * 0.45,
      );
    }
  }
}

// 종이비행기 모양(비행기 기준 좌표, m). 오른쪽 x, 위 y, 앞 z.
// 뾰족한 기수에서 뒤로 넓어지는 두 날개와, 가운데 아래로 접혀 내려온 몸통으로 이뤄진다.
// 날개 폭(1.9m)은 부딪힘 판정 폭(1.8m)과 거의 같다.
const PAPER_NOSE: Vec3 = [0, 0.02, 1.2];
const PAPER_TAIL: Vec3 = [0, 0, -0.8];
const PAPER_LEFT_TIP: Vec3 = [-0.95, 0.34, -0.85];
const PAPER_RIGHT_TIP: Vec3 = [0.95, 0.34, -0.85];
const PAPER_KEEL: Vec3 = [0, -0.3, -0.7];
const PAPER = "#f7f5ef";
const PAPER_SHADE = "#dedad0";
const PAPER_KEEL_COLOR = "#cdc7bb";
const PAPER_EDGE = "#7f796f";

// 기수를 드는 각(pitch)과 옆으로 기우는 각(roll)만큼 돌린다.
function orient([x, y, z]: Vec3, pitch: number, roll: number): Vec3 {
  const py = y * Math.cos(pitch) + z * Math.sin(pitch);
  const pz = z * Math.cos(pitch) - y * Math.sin(pitch);
  return [x * Math.cos(roll) - py * Math.sin(roll), x * Math.sin(roll) + py * Math.cos(roll), pz];
}

function drawPaperPlane(
  context: CanvasRenderingContext2D,
  camera: Camera,
  plane: Plane,
  crashed: boolean,
) {
  // 오른쪽으로 틀면 오른쪽 날개가 내려가고, 오를 때 기수가 든다. 부딪히면 옆으로 뒤집히며 고꾸라진다.
  const roll = crashed ? -1.1 : -(plane.vx / STEER_SPEED) * 0.55;
  const pitch = crashed ? -0.5 : (plane.vy / MAX_CLIMB) * 0.35;
  const at = (point: Vec3) => {
    const [x, y, z] = orient(point, pitch, roll);
    return project(camera, plane.x + x, plane.y + y, plane.distance + z);
  };

  // 땅 위 그림자. 높이 날수록 옅어진다.
  const left = project(camera, plane.x - 0.9, 0, plane.distance);
  const right = project(camera, plane.x + 0.9, 0, plane.distance);
  context.globalAlpha = Math.max(0.05, 0.25 - plane.y / 200);
  context.fillStyle = "#000";
  context.beginPath();
  context.ellipse(
    (left.x + right.x) / 2,
    left.y,
    (right.x - left.x) / 2,
    (right.x - left.x) / 8,
    0,
    0,
    Math.PI * 2,
  );
  context.fill();
  context.globalAlpha = 1;

  const nose = at(PAPER_NOSE);
  const tail = at(PAPER_TAIL);
  const leftTip = at(PAPER_LEFT_TIP);
  const rightTip = at(PAPER_RIGHT_TIP);
  const keel = at(PAPER_KEEL);
  const face = (points: { x: number; y: number }[], color: string) => {
    context.beginPath();
    points.forEach(({ x, y }, index) =>
      index === 0 ? context.moveTo(x, y) : context.lineTo(x, y),
    );
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.stroke();
  };
  context.lineJoin = "round";
  context.lineWidth = Math.max(1, camera.focal * 0.004);
  context.strokeStyle = PAPER_EDGE;

  // 아래로 접힌 몸통 → 낮은 쪽 날개 → 높은 쪽 날개 순으로 그려 위에 있는 면이 앞을 가린다.
  face([nose, tail, keel], PAPER_KEEL_COLOR);
  const leftWing = [nose, leftTip, tail];
  const rightWing = [nose, tail, rightTip];
  // 빛이 왼쪽 위에서 와서 오른쪽 날개가 조금 어둡다.
  const wings = [
    { points: leftWing, color: PAPER, tipY: leftTip.y },
    { points: rightWing, color: PAPER_SHADE, tipY: rightTip.y },
  ].sort((a, b) => b.tipY - a.tipY);
  wings.forEach(({ points, color }) => face(points, color));
  // 가운데 접힌 선
  context.beginPath();
  context.moveTo(nose.x, nose.y);
  context.lineTo(tail.x, tail.y);
  context.stroke();
}

export function drawScene(
  canvas: HTMLCanvasElement,
  plane: Plane,
  colors: SceneColors,
  crashed: boolean,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height } = canvas;
  const camera: Camera = {
    x: plane.x,
    y: plane.y + CAMERA_UP,
    z: plane.distance - CAMERA_BACK,
    focal: height * 0.9,
    centerX: width / 2,
    horizonY: height * 0.4,
  };

  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = toCss(colors.sky);
  context.fillRect(0, 0, width, height);

  // 땅. 지평선 아래를 채우고, 흘러가는 가로줄로 속도를 보여준다.
  // 건물과 같은 규칙으로 멀수록 하늘색이 섞여, 지평선에서 땅과 하늘이 딱 끊기지 않고 이어진다.
  // 땅의 깊이는 화면 y와 한 방향으로 대응해서 세로 그라데이션 하나로 거리별 색을 낼 수 있다.
  const horizon = project(camera, 0, 0, camera.z + 100000).y;
  const viewY = project(camera, 0, 0, camera.z + VIEW_DISTANCE).y;
  const fogY = project(camera, 0, 0, camera.z + FOG_START).y;
  const fade = (near: Rgb) => {
    const gradient = context.createLinearGradient(0, horizon, 0, fogY);
    const view = fogY > horizon ? (viewY - horizon) / (fogY - horizon) : 0;
    gradient.addColorStop(0, toCss(colors.sky));
    gradient.addColorStop(Math.min(1, Math.max(0, view)), toCss(mix(near, colors.sky, FOG_MAX)));
    gradient.addColorStop(1, toCss(near));
    return gradient;
  };
  context.fillStyle = fade(GROUND);
  context.fillRect(0, horizon, width, height - horizon);
  context.strokeStyle = fade(GROUND_LINE);
  context.lineWidth = Math.max(1, height * 0.003);
  context.beginPath();
  const firstLine = Math.ceil((camera.z + 1) / GROUND_LINE_SPACING) * GROUND_LINE_SPACING;
  for (let z = firstLine; z < camera.z + VIEW_DISTANCE; z += GROUND_LINE_SPACING) {
    const y = project(camera, 0, 0, z).y;
    context.moveTo(0, y);
    context.lineTo(width, y);
  }
  for (const edge of [-HALF_WIDTH, HALF_WIDTH]) {
    const from = project(camera, edge, 0, camera.z + 1);
    const to = project(camera, edge, 0, camera.z + VIEW_DISTANCE);
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
  }
  context.stroke();

  // 먼 줄부터 그려 가까운 줄이 앞을 가린다. 같은 줄에서는 옆으로 먼 건물부터 그려
  // 가운데 가까운 건물이 옆 건물의 옆면을 가린다. 줄끼리·건물끼리 겹치지 않아 이 순서로 충분하다.
  const buildings = plane.buildings
    .filter((building) => building.z < camera.z + VIEW_DISTANCE)
    .sort((a, b) => b.row - a.row || Math.abs(b.x - camera.x) - Math.abs(a.x - camera.x));
  // 비행기 앞과 옆의 건물 → 비행기 → 비행기가 지나쳐 카메라와 비행기 사이에 있는 건물 순으로 그린다.
  const passed = (building: Building) => building.z + building.depth < plane.distance;
  const draw = (building: Building) => drawBuilding(context, camera, building, colors);
  buildings.filter((building) => !passed(building)).forEach(draw);
  drawPaperPlane(context, camera, plane, crashed);
  buildings.filter(passed).forEach(draw);
}
