import "server-only";

// 인증용 AUTH_SECRET과 나눠 한쪽이 새도 다른 쪽에 영향이 없게 한다.
export function playTokenSecret() {
  const secret = process.env.PLAY_TOKEN_SECRET;
  if (!secret) {
    throw new Error("PLAY_TOKEN_SECRET 환경 변수가 없어요.");
  }
  return secret;
}
