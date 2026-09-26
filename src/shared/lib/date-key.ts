// 날짜는 KST 기준 "YYYY-MM-DD" 문자열(date key)로 다룬다. 시각과 시간대를 들고 다니지 않기 위해서다.
const kstDateKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const DAY_MS = 24 * 60 * 60 * 1000;

export function toKstDateKey(date: Date) {
  return kstDateKeyFormat.format(date);
}

function toUtcMs(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUtcMs(to) - toUtcMs(from)) / DAY_MS);
}

export function addDays(dateKey: string, days: number) {
  return new Date(toUtcMs(dateKey) + days * DAY_MS).toISOString().slice(0, 10);
}

// 0 = 일요일
export function weekdayOf(dateKey: string) {
  return new Date(toUtcMs(dateKey)).getUTCDay();
}

// KST 자정을 가리키는 Date. 화면에 날짜를 쓸 때 쓴다.
export function dateKeyToKstDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00+09:00`);
}
