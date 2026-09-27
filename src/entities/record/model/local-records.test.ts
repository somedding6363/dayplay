import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readLocalRecords,
  removeLocalRecords,
  saveLocalRecord,
  type LocalRecord,
} from "./local-records";

const record = (overrides: Partial<LocalRecord>): LocalRecord => ({
  id: crypto.randomUUID(),
  date: "2026-09-28",
  gameId: "reaction-time",
  rawResult: {},
  score: -200,
  playToken: "token",
  finishedAt: "2026-09-28T01:00:00.000Z",
  ...overrides,
});

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
});

describe("local records", () => {
  it("날짜·게임마다 더 좋은 기록 하나만 남긴다", () => {
    saveLocalRecord(record({ score: -200 }));
    saveLocalRecord(record({ score: -250 }));
    saveLocalRecord(record({ score: -180 }));
    saveLocalRecord(record({ score: -180, id: "same-score" }));

    expect(readLocalRecords().map((item) => item.score)).toEqual([-180]);
    expect(readLocalRecords()[0].id).not.toBe("same-score");
  });

  it("무효 기록은 첫 기록일 때만 남고, 점수가 있는 기록이 이긴다", () => {
    saveLocalRecord(record({ score: null }));
    expect(readLocalRecords().map((item) => item.score)).toEqual([null]);

    saveLocalRecord(record({ score: -300 }));
    saveLocalRecord(record({ score: null }));
    expect(readLocalRecords().map((item) => item.score)).toEqual([-300]);
  });

  it("다른 날짜나 게임의 기록은 따로 남긴다", () => {
    saveLocalRecord(record({}));
    saveLocalRecord(record({ date: "2026-09-29" }));
    saveLocalRecord(record({ gameId: "ten-seconds" }));

    expect(readLocalRecords()).toHaveLength(3);
  });

  it("지정한 기록만 지운다", () => {
    const kept = record({ date: "2026-09-29" });
    const removed = record({});
    saveLocalRecord(kept);
    saveLocalRecord(removed);
    removeLocalRecords([removed.id]);

    expect(readLocalRecords()).toEqual([kept]);
  });

  it("깨진 저장 값은 무시한다", () => {
    localStorage.setItem("dayplay:records:v1", "{not json");
    expect(readLocalRecords()).toEqual([]);

    localStorage.setItem("dayplay:records:v1", JSON.stringify([{ id: 1 }, record({ id: "ok" })]));
    expect(readLocalRecords().map((item) => item.id)).toEqual(["ok"]);
  });
});
