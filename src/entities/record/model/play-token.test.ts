import { describe, expect, it } from "vitest";
import { signToken } from "@/shared/lib";
import { createPlayToken, PLAY_TOKEN_MAX_AGE_MS, readPlayToken } from "./play-token";

const secret = "test-secret";
const issuedAt = Date.UTC(2026, 8, 28, 14, 59, 0);
const claims = { playId: "p1", gameId: "reaction-time", date: "2026-09-28", issuedAt };

describe("play token", () => {
  it("발급한 토큰을 읽으면 같은 claims가 나온다", async () => {
    const token = await createPlayToken(claims, secret);
    expect(await readPlayToken(token, secret, issuedAt + 1000)).toEqual(claims);
  });

  it("KST 자정을 넘겨도 판의 날짜는 발급한 날짜다", async () => {
    const token = await createPlayToken(claims, secret);
    const afterMidnight = issuedAt + 2 * 60 * 1000;
    expect((await readPlayToken(token, secret, afterMidnight))?.date).toBe("2026-09-28");
  });

  it("만료된 토큰은 거부한다", async () => {
    const token = await createPlayToken(claims, secret);
    expect(await readPlayToken(token, secret, issuedAt + PLAY_TOKEN_MAX_AGE_MS)).not.toBeNull();
    expect(await readPlayToken(token, secret, issuedAt + PLAY_TOKEN_MAX_AGE_MS + 1)).toBeNull();
  });

  it("발급 시각이 너무 미래인 토큰은 거부한다", async () => {
    const token = await createPlayToken(claims, secret);
    expect(await readPlayToken(token, secret, issuedAt - 60 * 1000)).toBeNull();
  });

  it("다른 비밀키로 만든 토큰은 거부한다", async () => {
    const token = await createPlayToken(claims, "other-secret");
    expect(await readPlayToken(token, secret, issuedAt)).toBeNull();
  });

  it("서명은 맞아도 claims 모양이 틀리면 거부한다", async () => {
    const token = await signToken({ playId: "p1", gameId: "reaction-time", issuedAt }, secret);
    expect(await readPlayToken(token, secret, issuedAt)).toBeNull();
  });
});
