import { describe, expect, it } from "vitest";
import { TIMEOUT_MS, formatSeconds, tenSecondsRules, toElapsedMs } from "./rules";

const { parseResult, toValue, formatResult, formatValue, isValidValue, durationMs } =
  tenSecondsRules;

describe("toElapsedMs", () => {
  it("시작부터 입력까지를 정수 ms로 바꾸고, 제한 시간을 넘기면 무효다", () => {
    expect(toElapsedMs(9920.4)).toBe(9920);
    expect(toElapsedMs(TIMEOUT_MS)).toBe(TIMEOUT_MS);
    expect(toElapsedMs(TIMEOUT_MS + 1)).toBeNull();
    expect(toElapsedMs(0)).toBeNull();
  });
});

describe("tenSecondsRules", () => {
  it("값은 10초와의 차이의 절댓값이다", () => {
    const early = parseResult({ elapsedMs: 9920 });
    const late = parseResult({ elapsedMs: 10_080 });
    expect(early && toValue(early)).toBe(80);
    expect(late && toValue(late)).toBe(80);
    expect(tenSecondsRules.better).toBe("lower");
  });

  it("게임 판은 멈춘 시각, 저장된 기록은 차이로 보여준다", () => {
    const result = parseResult({ elapsedMs: 9920 });
    expect(result && formatResult(result)).toBe("9.920초");
    expect(formatValue(80)).toBe("±0.080초");
    expect(formatValue(44)).toBe("±0.044초");
    expect(formatValue(0)).toBe("±0.000초");
    expect(formatSeconds(9956.4)).toBe("9.956");
  });

  it("제한 시간 안에 멈추지 않으면 무효이고 -로 표시한다", () => {
    const result = parseResult({ elapsedMs: null });
    expect(result && toValue(result)).toBeNull();
    expect(result && formatResult(result)).toBe("-");
    expect(result && durationMs(result)).toBe(TIMEOUT_MS);
    expect(formatValue(null)).toBe("-");
  });

  it("불가능한 결과와 값은 거부한다", () => {
    expect(parseResult({ elapsedMs: 0 })).toBeNull();
    expect(parseResult({ elapsedMs: TIMEOUT_MS + 1 })).toBeNull();
    expect(parseResult({ elapsedMs: 9920.5 })).toBeNull();
    expect(parseResult({})).toBeNull();
    expect(isValidValue(0)).toBe(true);
    expect(isValidValue(10_000)).toBe(true);
    expect(isValidValue(10_001)).toBe(false);
    expect(isValidValue(-1)).toBe(false);
  });
});
