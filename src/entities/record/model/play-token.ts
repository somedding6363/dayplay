import { signToken, verifyToken } from "@/shared/lib";

// 판을 시작할 때 서버가 발급하는 정보. 결과를 저장할 때 이 판이 서버가 연 판인지 확인한다(D-16).
export interface PlayClaims {
  playId: string;
  gameId: string;
  // 판을 시작한 날의 KST date key. 자정을 넘겨 끝내도 이 날짜의 기록이다.
  date: string;
  issuedAt: number;
}

// 한 판을 끝내고 저장하기까지 허용하는 시간. 자정 이후 저장 가능 기간도 이 값이 정한다.
export const PLAY_TOKEN_MAX_AGE_MS = 60 * 60 * 1000;

// 서버 간 시계 차이로 발급 시각이 조금 미래일 수 있다.
const CLOCK_SKEW_MS = 5 * 1000;

function isPlayClaims(value: unknown): value is PlayClaims {
  return (
    typeof value === "object" &&
    value !== null &&
    "playId" in value &&
    typeof value.playId === "string" &&
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
export async function readPlayToken(token: string, secret: string, now: number) {
  const payload = await verifyToken(token, secret);
  if (!isPlayClaims(payload)) {
    return null;
  }
  const age = now - payload.issuedAt;
  if (age < -CLOCK_SKEW_MS || age > PLAY_TOKEN_MAX_AGE_MS) {
    return null;
  }
  return payload;
}
