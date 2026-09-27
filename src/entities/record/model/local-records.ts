import { isBetterScore } from "./best";

// 비로그인 기록. 날짜·게임마다 한 칸을 두고, 그 칸을 play마다 갱신한다.
export interface LocalRecord {
  // 칸이 처음 생길 때 만든다. 같은 날짜·게임을 계속 해도 바뀌지 않는다. 병합 요청의 key다.
  id: string;
  date: string;
  gameId: string;
  // 이 칸의 최고 결과. 더 좋은 결과가 나올 때만 바뀐다.
  rawResult: unknown;
  score: number | null;
  // 최고 결과를 낸 play의 토큰. 토큰 발급에 실패한 play는 null이고, 이 기기에 보여주기만 하고 병합하지 않는다.
  playToken: string | null;
  achievedAt: string;
  // 끝낸 play 수. 무효와 더 낮은 결과도 센다.
  attempts: number;
  lastPlayedAt: string;
}

export interface LocalPlay {
  date: string;
  gameId: string;
  rawResult: unknown;
  score: number | null;
  playToken: string | null;
  playedAt: string;
}

const STORAGE_KEY = "dayplay:records:v2";
const listeners = new Set<() => void>();
const empty: LocalRecord[] = [];
let cache: { raw: string | null; records: LocalRecord[] } = { raw: null, records: empty };

function isLocalRecord(value: unknown): value is LocalRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "date" in value &&
    typeof value.date === "string" &&
    "gameId" in value &&
    typeof value.gameId === "string" &&
    "rawResult" in value &&
    "score" in value &&
    (value.score === null || typeof value.score === "number") &&
    "playToken" in value &&
    (value.playToken === null || typeof value.playToken === "string") &&
    "achievedAt" in value &&
    typeof value.achievedAt === "string" &&
    "attempts" in value &&
    Number.isInteger(value.attempts) &&
    "lastPlayedAt" in value &&
    typeof value.lastPlayedAt === "string"
  );
}

// 사생활 보호 모드처럼 저장소를 쓸 수 없으면 기록 없이 동작한다.
function readRaw() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function parse(raw: string | null): LocalRecord[] {
  if (!raw) {
    return empty;
  }
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter(isLocalRecord) : empty;
  } catch {
    return empty;
  }
}

// useSyncExternalStore가 같은 값에 같은 배열을 받도록 저장된 문자열이 바뀔 때만 새로 읽는다.
export function readLocalRecords() {
  const raw = readRaw();
  if (raw !== cache.raw) {
    cache = { raw, records: parse(raw) };
  }
  return cache.records;
}

export function readServerLocalRecords() {
  return empty;
}

function write(records: LocalRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 저장하지 못해도 이번 결과 표시는 계속한다.
  }
  listeners.forEach((listener) => listener());
}

// 끝낸 play 하나를 그날 그 게임의 칸에 반영한다. 칸이 없으면 만들고, 있으면 횟수를 늘리고 더 좋을 때만 최고 결과를 바꾼다.
export function recordLocalPlay(play: LocalPlay) {
  const records = readLocalRecords();
  const current = records.find((item) => item.date === play.date && item.gameId === play.gameId);
  const best = {
    rawResult: play.rawResult,
    score: play.score,
    playToken: play.playToken,
    achievedAt: play.playedAt,
  };

  const next: LocalRecord = current
    ? {
        ...current,
        ...(isBetterScore(play.score, current.score) ? best : {}),
        attempts: current.attempts + 1,
        lastPlayedAt: play.playedAt,
      }
    : {
        id: crypto.randomUUID(),
        date: play.date,
        gameId: play.gameId,
        ...best,
        attempts: 1,
        lastPlayedAt: play.playedAt,
      };
  write(records.map((item) => (item === current ? next : item)).concat(current ? [] : [next]));
}

export function removeLocalRecords(ids: string[]) {
  const records = readLocalRecords();
  write(records.filter((record) => !ids.includes(record.id)));
}

export function subscribeLocalRecords(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 저장한 기록도 반영한다.
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
