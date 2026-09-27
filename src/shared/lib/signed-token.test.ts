import { describe, expect, it } from "vitest";
import { signToken, verifyToken } from "./signed-token";

describe("signed token", () => {
  it("같은 비밀키로 서명한 payload를 그대로 돌려준다", async () => {
    const token = await signToken({ a: 1, b: "가" }, "secret");
    expect(await verifyToken(token, "secret")).toEqual({ a: 1, b: "가" });
  });

  it("다른 비밀키로 서명한 토큰은 거부한다", async () => {
    const token = await signToken({ a: 1 }, "other");
    expect(await verifyToken(token, "secret")).toBeNull();
  });

  it("payload를 바꾼 토큰은 거부한다", async () => {
    const token = await signToken({ score: 1 }, "secret");
    const [, signature] = token.split(".");
    const [body] = (await signToken({ score: 999 }, "secret")).split(".");
    const forged = `${body}.${signature}`;
    expect(await verifyToken(forged, "secret")).toBeNull();
  });

  it("형식이 틀린 토큰은 거부한다", async () => {
    expect(await verifyToken("", "secret")).toBeNull();
    expect(await verifyToken("abc", "secret")).toBeNull();
    expect(await verifyToken("a.b.c", "secret")).toBeNull();
    expect(await verifyToken("!!.??", "secret")).toBeNull();
  });
});
