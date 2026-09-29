import {
  ROAD_HALF_WIDTH,
  WALL_DISTANCE,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  trackPoints,
  type Car,
} from "../model/track";

const CAR_LENGTH = 40;
const CAR_WIDTH = 22;

export interface RaceColors {
  outside: string;
  sand: string;
  wall: string;
  road: string;
  car: string;
}

// 게임 색은 플랫폼이 주입한 --game-* 변수에서 읽는다. Tailwind는 --color-game-* 를 class에만 풀어 써서 computed style에 없다.
export function readRaceColors(element: Element): RaceColors {
  const style = getComputedStyle(element);
  const read = (name: string) => style.getPropertyValue(name).trim();
  return {
    outside: read("--game-soft"),
    sand: read("--game-mid"),
    wall: read("--game-ink"),
    road: read("--color-canvas"),
    car: read("--game-color"),
  };
}

// 판 크기가 달라도 월드 전체가 보이게 가운데에 맞춘다.
function fitWorld(context: CanvasRenderingContext2D, width: number, height: number) {
  const scale = Math.min(width / WORLD_WIDTH, height / WORLD_HEIGHT);
  context.setTransform(
    scale,
    0,
    0,
    scale,
    (width - WORLD_WIDTH * scale) / 2,
    (height - WORLD_HEIGHT * scale) / 2,
  );
}

// 가운데 선에서 양쪽으로 halfWidth만큼 떨어진 두 가장자리 사이를 채운다.
// 굵은 선(stroke)으로 그리면 iOS Safari에서 선 이음새가 도로를 가로지르는 얇은 줄로 보여서 면으로 그린다.
// 곡률 반경이 halfWidth보다 커서 안쪽 가장자리가 스스로 겹치지 않는다(track.test.ts).
function fillTrackBand(context: CanvasRenderingContext2D, halfWidth: number, color: string) {
  const count = trackPoints.length;
  const edge = (side: 1 | -1) =>
    trackPoints.map((point, index) => {
      const previous = trackPoints[(index - 1 + count) % count];
      const next = trackPoints[(index + 1) % count];
      const length = Math.hypot(next.x - previous.x, next.y - previous.y);
      return {
        x: point.x - ((next.y - previous.y) / length) * halfWidth * side,
        y: point.y + ((next.x - previous.x) / length) * halfWidth * side,
      };
    });
  context.beginPath();
  const sides: (1 | -1)[] = [1, -1];
  for (const side of sides) {
    edge(side).forEach(({ x, y }, index) =>
      index === 0 ? context.moveTo(x, y) : context.lineTo(x, y),
    );
    context.closePath();
  }
  context.fillStyle = color;
  context.fill("evenodd");
}

// 트랙은 바뀌지 않아서 판 크기가 바뀔 때만 그린다.
export function drawTrack(canvas: HTMLCanvasElement, colors: RaceColors) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.fillStyle = colors.outside;
  context.fillRect(0, 0, canvas.width, canvas.height);
  fitWorld(context, canvas.width, canvas.height);
  fillTrackBand(context, WALL_DISTANCE + 4, colors.wall);
  fillTrackBand(context, WALL_DISTANCE, colors.sand);
  fillTrackBand(context, ROAD_HALF_WIDTH, colors.road);

  // 출발선. 가운데 선에 수직인 체크무늬 띠
  const [start, next] = trackPoints;
  context.save();
  context.translate(start.x, start.y);
  context.rotate(Math.atan2(next.y - start.y, next.x - start.x));
  const cell = (ROAD_HALF_WIDTH * 2) / 8;
  for (let row = 0; row < 8; row += 1) {
    for (let column = 0; column < 2; column += 1) {
      context.fillStyle = (row + column) % 2 === 0 ? colors.wall : colors.road;
      context.fillRect(column * cell - cell, row * cell - ROAD_HALF_WIDTH, cell, cell);
    }
  }
  context.restore();
}

export function drawCar(
  canvas: HTMLCanvasElement,
  track: HTMLCanvasElement,
  car: Car,
  colors: RaceColors,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.drawImage(track, 0, 0);
  fitWorld(context, canvas.width, canvas.height);
  context.translate(car.x, car.y);
  context.rotate(car.heading);
  context.fillStyle = colors.car;
  context.strokeStyle = colors.wall;
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(-CAR_LENGTH / 2, -CAR_WIDTH / 2, CAR_LENGTH, CAR_WIDTH, 4);
  context.fill();
  context.stroke();
  // 앞 유리. 차가 어느 쪽을 보는지 알린다.
  context.fillStyle = colors.wall;
  context.fillRect(CAR_LENGTH / 2 - 10, -CAR_WIDTH / 2 + 3, 4, CAR_WIDTH - 6);
}
