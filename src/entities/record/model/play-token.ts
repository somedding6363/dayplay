import { signToken, verifyToken } from "@/shared/lib";

// play를 시작할 때 서버가 발급하는 정보. 결과를 저장할 때 이 play가 서버가 발급한 play인지 확인한다(D-16).
export interface PlayClaims {
  gameId: string;
  // play를 시작한 날의 KST date key. 자정을 넘겨 끝내도 이 날짜의 기록이다.
  date: string;
  issuedAt: number;
}

// 한 play를 끝내고 저장하기까지 허용하는 시간. 자정 이후 저장 가능 기간도 이 값이 정한다.
export const PLAY_TOKEN_MAX_AGE_MS = 60 * 60 * 1000;

// 서버 간 시계 차이로 발급 시각이 조금 미래일 수 있다.
const CLOCK_SKEW_MS = 5 * 1000;

function isPlayClaims(value: unknown): value is PlayClaims {
  return (
    typeof value === "object" &&
    value !== null &&
    "gameId" in value &&
    typeof value.gameId === "string" &&
    "date" in value &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date) &&
    "issuedAt" in value &&
    typeof value.issuedAt === "number"
  );
}

export function createPlayToken(claims: PlayClaims, secret: string) {
  return signToken(claims, secret);
}

// 서명, 형식, 만료를 모두 통과하면 claims를, 아니면 null을 돌려준다.
// maxAgeMs는 로그인 직후 병합처럼 끝낸 뒤 한참 지나 저장하는 경우에만 늘린다.
export async function readPlayToken(
  token: string,
  secret: string,
  now: number,
  maxAgeMs = PLAY_TOKEN_MAX_AGE_MS,
) {
  const payload = await verifyToken(token, secret);
  if (!isPlayClaims(payload)) {
    return null;
  }
  const age = now - payload.issuedAt;
  if (age < -CLOCK_SKEW_MS || age > maxAgeMs) {
    return null;
  }
  return payload;
}

// 결과가 주장하는 play 시간이 토큰 발급 후 실제로 지난 시간 안에 들어가는지 본다.
// 네트워크 지연으로 실제 시간은 항상 더 길기 때문에 짧은 쪽은 허용한다.
export function fitsElapsed(play: PlayClaims, durationMs: number, now: number) {
  return (
    Number.isFinite(durationMs) &&
    durationMs >= 0 &&
    durationMs <= now - play.issuedAt + CLOCK_SKEW_MS
  );
}
