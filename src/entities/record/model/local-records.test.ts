import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readLocalRecords,
  recordLocalPlay,
  removeLocalRecords,
  type LocalPlay,
} from "./local-records";

const play = (overrides: Partial<LocalPlay>): LocalPlay => ({
  date: "2026-09-28",
  gameId: "reaction-time",
  rawResult: { ms: 200 },
  score: -200,
  playToken: "token",
  playedAt: "2026-09-28T01:00:00.000Z",
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
  it("같은 날짜·게임은 한 칸의 id를 유지하며 횟수를 늘리고 최고 결과만 바꾼다", () => {
    recordLocalPlay(play({ score: -200, playedAt: "t1" }));
    const [first] = readLocalRecords();

    recordLocalPlay(play({ score: -250, rawResult: { ms: 250 }, playedAt: "t2" }));
    recordLocalPlay(
      play({ score: -180, rawResult: { ms: 180 }, playToken: "best", playedAt: "t3" }),
    );
    recordLocalPlay(play({ score: -190, rawResult: { ms: 190 }, playedAt: "t4" }));

    expect(readLocalRecords()).toEqual([
      {
        id: first.id,
        date: "2026-09-28",
        gameId: "reaction-time",
        rawResult: { ms: 180 },
        score: -180,
        playToken: "best",
        achievedAt: "t3",
        attempts: 4,
        lastPlayedAt: "t4",
      },
    ]);
  });

  it("같은 점수는 먼저 세운 결과를 남긴다", () => {
    recordLocalPlay(play({ playToken: "first" }));
    recordLocalPlay(play({ playToken: "second" }));

    expect(readLocalRecords()[0]).toMatchObject({ playToken: "first", attempts: 2 });
  });

  it("무효 결과도 횟수에 세고, 점수가 있는 결과가 무효를 이긴다", () => {
    recordLocalPlay(play({ score: null, rawResult: { ms: null } }));
    expect(readLocalRecords()[0]).toMatchObject({ score: null, attempts: 1 });

    recordLocalPlay(play({ score: -300 }));
    recordLocalPlay(play({ score: null, rawResult: { ms: null } }));
    expect(readLocalRecords()[0]).toMatchObject({ score: -300, attempts: 3 });
  });

  it("다른 날짜나 게임은 따로 센다", () => {
    recordLocalPlay(play({}));
    recordLocalPlay(play({ date: "2026-09-29" }));
    recordLocalPlay(play({ gameId: "ten-seconds" }));

    expect(readLocalRecords().map((record) => record.attempts)).toEqual([1, 1, 1]);
  });

  it("지정한 칸만 지운다", () => {
    recordLocalPlay(play({ date: "2026-09-29" }));
    recordLocalPlay(play({}));
    const [kept, removed] = readLocalRecords();
    removeLocalRecords([removed.id]);

    expect(readLocalRecords()).toEqual([kept]);
  });

  it("깨진 저장 값은 무시한다", () => {
    localStorage.setItem("dayplay:records:v2", "{not json");
    expect(readLocalRecords()).toEqual([]);

    recordLocalPlay(play({}));
    const [valid] = readLocalRecords();
    localStorage.setItem("dayplay:records:v2", JSON.stringify([{ id: 1 }, valid]));
    expect(readLocalRecords()).toEqual([valid]);
  });
});
