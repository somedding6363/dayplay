import { describe, expect, it } from "vitest";
import { addDays, daysBetween, toKstDateKey, weekdayOf } from "./date-key";

describe("toKstDateKey", () => {
  it("UTC 15시 이후는 KST 다음 날이다", () => {
    expect(toKstDateKey(new Date("2026-09-26T14:59:59Z"))).toBe("2026-09-26");
    expect(toKstDateKey(new Date("2026-09-26T15:00:00Z"))).toBe("2026-09-27");
  });
});

describe("daysBetween, addDays", () => {
  it("월과 연도를 넘어 계산한다", () => {
    expect(daysBetween("2026-12-30", "2027-01-02")).toBe(3);
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
  });
});

describe("weekdayOf", () => {
  it("요일을 0(일)~6(토)으로 준다", () => {
    expect(weekdayOf("2026-09-21")).toBe(1);
    expect(weekdayOf("2026-09-26")).toBe(6);
  });
});
