import { jumpHeight, type Rope } from "../model/rope";

// 앞에서 본 운동장. 가운데에서 공이 뛰고, 양쪽 땅에 박힌 기둥에서 긴 줄이 돈다. 단위는 m이고 y는 땅에서 위로, z는 화면 쪽이 양수다.
// 기둥을 높이고 폭을 좁혀 줄이 크게 휘며 돈다. 맨 위에서는 기둥 높이의 약 두 배까지 올라간다.
const TURNER_X = 2.8;
const HAND_Y = 1.7;
// 줄 끝은 기둥 꼭대기에 묶여 있고, 가운데가 이만큼 늘어진 채 돈다. 공 밑을 지날 때 줄 가운데가 땅에 닿는다.
const ROPE_SAG = HAND_Y;
// 점프 최고 높이와 공 반지름, 기둥 반지름
const JUMP_HEIGHT = 0.55;
const BALL_RADIUS = 0.36;
const POLE_RADIUS = 0.07;
// 카메라는 앞(z 양수)에서 공을 조금 내려다본다.
const CAMERA_Z = 7;
const CAMERA_Y = 1.5;
const ROPE_SAMPLES = 28;

// 기둥은 게임 색이 아니라 실제 나무 색으로 그린다.
const POLE: Rgb = [150, 112, 78];
const GROUND: Rgb = [214, 222, 200];
const ROPE: Rgb = [60, 52, 70];

type Rgb = [number, number, number];

function parseHex(hex: string): Rgb | null {
  const value = hex.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const channel = (index: number) => parseInt(value.slice(index, index + 2), 16);
  return [channel(0), channel(2), channel(4)];
}

const mix = (a: Rgb, b: Rgb, t: number): Rgb => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];
const css = ([r, g, b]: Rgb, alpha = 1) =>
  `rgb(${Math.round(r)} ${Math.round(g)} ${Math.round(b)} / ${alpha})`;
const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

export interface SceneColors {
  sky: Rgb;
  jumper: Rgb;
}

// 게임 색은 플랫폼이 주입한 --game-* 변수에서 읽는다. Tailwind는 --color-game-* 를 class에만 풀어 써서 computed style에 없다.
export function readSceneColors(element: Element): SceneColors {
  const style = getComputedStyle(element);
  const read = (name: string, fallback: Rgb) => parseHex(style.getPropertyValue(name)) ?? fallback;
  return {
    sky: read("--game-soft", [245, 229, 248]),
    jumper: read("--game-color", [178, 79, 196]),
  };
}

interface Camera {
  focal: number;
  centerX: number;
  horizonY: number;
}

function project(camera: Camera, x: number, y: number, z: number) {
  const scale = camera.focal / (CAMERA_Z - z);
  return {
    x: camera.centerX + x * scale,
    y: camera.horizonY - (y - CAMERA_Y) * scale,
    scale,
  };
}

// 땅에 박힌 기둥. 둥근 막대처럼 가운데가 밝고 양옆이 어둡다. 줄 끝이 꼭대기에 바로 묶여 있다.
function drawPole(context: CanvasRenderingContext2D, camera: Camera, x: number) {
  const base = project(camera, x, 0, 0);
  const top = project(camera, x, HAND_Y, 0);
  const half = POLE_RADIUS * base.scale;
  const wood = context.createLinearGradient(base.x - half, 0, base.x + half, 0);
  wood.addColorStop(0, css(mix(POLE, BLACK, 0.35)));
  wood.addColorStop(0.4, css(mix(POLE, WHITE, 0.3)));
  wood.addColorStop(1, css(mix(POLE, BLACK, 0.45)));
  context.fillStyle = wood;
  context.fillRect(base.x - half, top.y, half * 2, base.y - top.y);
  // 꼭대기 마개
  context.fillStyle = css(mix(POLE, BLACK, 0.2));
  context.beginPath();
  context.ellipse(top.x, top.y, half, half * 0.4, 0, 0, Math.PI * 2);
  context.fill();
}

// 뛰는 공. 왼쪽 위에서 빛을 받은 구로 그리고, 바닥이 (x, y)에 닿는다. 걸리면 납작하게 찌그러진다.
function drawBall(
  context: CanvasRenderingContext2D,
  camera: Camera,
  y: number,
  color: Rgb,
  caught: boolean,
) {
  const bottom = project(camera, 0, y, 0);
  const radius = BALL_RADIUS * bottom.scale;
  const squash = caught ? 0.72 : 1;
  const centerY = bottom.y - radius * squash;
  const gradient = context.createRadialGradient(
    bottom.x - radius * 0.35,
    centerY - radius * 0.4 * squash,
    radius * 0.1,
    bottom.x,
    centerY,
    radius,
  );
  gradient.addColorStop(0, css(mix(color, WHITE, 0.6)));
  gradient.addColorStop(0.4, css(color));
  gradient.addColorStop(1, css(mix(color, BLACK, 0.4)));
  context.fillStyle = gradient;
  context.beginPath();
  context.ellipse(bottom.x, centerY, radius / squash ** 0.5, radius * squash, 0, 0, Math.PI * 2);
  context.fill();
}

// 땅 위 그림자. 높이 뜰수록 작고 옅어진다.
function drawShadow(context: CanvasRenderingContext2D, camera: Camera, x: number, lift: number) {
  const point = project(camera, x, 0, 0);
  const width = BALL_RADIUS * point.scale * (1 - lift * 0.5);
  context.fillStyle = css(BLACK, 0.18 * (1 - lift * 0.6));
  context.beginPath();
  context.ellipse(point.x, point.y, width, width * 0.25, 0, 0, Math.PI * 2);
  context.fill();
}

// 줄 위의 점. 줄은 x축을 축으로 돌고, 가운데일수록 크게 늘어진다.
function ropePoint(camera: Camera, x: number, angle: number) {
  const sag = ROPE_SAG * (1 - (x / TURNER_X) ** 2);
  return project(camera, x, HAND_Y + sag * Math.cos(angle), sag * Math.sin(angle));
}

function drawRope(context: CanvasRenderingContext2D, camera: Camera, angle: number) {
  // 앞으로 올수록 굵고 진하다.
  const depth = Math.sin(angle);
  const middle = ropePoint(camera, 0, angle);
  context.strokeStyle = css(mix(ROPE, WHITE, 0.3 - depth * 0.3));
  context.lineWidth = Math.max(1.5, 0.045 * middle.scale);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  for (let i = 0; i <= ROPE_SAMPLES; i += 1) {
    const x = -TURNER_X + (2 * TURNER_X * i) / ROPE_SAMPLES;
    const point = ropePoint(camera, x, angle);
    if (i === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  }
  context.stroke();
}

export function drawScene(canvas: HTMLCanvasElement, rope: Rope, colors: SceneColors) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height } = canvas;
  // 양쪽 기둥까지 판 폭에, 줄 꼭대기까지 판 높이에 들어가게 크기를 맞춘다.
  const focal = Math.min((width * 0.46) / (TURNER_X + 0.4), (height * 0.62) / 3.6) * CAMERA_Z;
  const camera: Camera = { focal, centerX: width / 2, horizonY: height * 0.5 };
  const angle = rope.phase * Math.PI * 2;

  context.setTransform(1, 0, 0, 1, 0, 0);
  const sky = context.createLinearGradient(0, 0, 0, camera.horizonY);
  sky.addColorStop(0, css(mix(colors.sky, WHITE, 0.5)));
  sky.addColorStop(1, css(colors.sky));
  context.fillStyle = sky;
  context.fillRect(0, 0, width, camera.horizonY);
  const ground = context.createLinearGradient(0, camera.horizonY, 0, height);
  ground.addColorStop(0, css(mix(GROUND, colors.sky, 0.5)));
  ground.addColorStop(1, css(mix(GROUND, WHITE, 0.15)));
  context.fillStyle = ground;
  context.fillRect(0, camera.horizonY, width, height - camera.horizonY);

  const lift = jumpHeight(rope);
  drawShadow(context, camera, 0, lift);

  for (const x of [-TURNER_X, TURNER_X]) drawPole(context, camera, x);

  // 줄이 뒤에 있으면 공 뒤로, 앞에 있으면 앞으로 지나간다.
  const ropeInFront = Math.sin(angle) > 0;
  if (!ropeInFront) drawRope(context, camera, angle);
  drawBall(context, camera, lift * JUMP_HEIGHT, colors.jumper, rope.caught);
  if (ropeInFront) drawRope(context, camera, angle);
}
