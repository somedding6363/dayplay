import { isBetterScore } from "./best";

// 비로그인 기록. 날짜·게임마다 가장 좋은 play 하나만 브라우저에 남긴다.
export interface LocalRecord {
  // 병합 요청의 idempotency key
  id: string;
  date: string;
  gameId: string;
  rawResult: unknown;
  score: number | null;
  // 토큰 발급에 실패한 play는 null. 이 기기에서 보여주기만 하고 계정에 병합하지 않는다.
  playToken: string | null;
  finishedAt: string;
}

const STORAGE_KEY = "dayplay:records:v1";
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
    "finishedAt" in value &&
    typeof value.finishedAt === "string"
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

export function saveLocalRecord(record: LocalRecord) {
  const records = readLocalRecords();
  const current = records.find(
    (item) => item.date === record.date && item.gameId === record.gameId,
  );
  if (current && !isBetterScore(record.score, current.score)) {
    return;
  }
  write([...records.filter((item) => item !== current), record]);
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
