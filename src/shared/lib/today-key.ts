import { toKstDateKey } from "./date-key";

// 서버에서만 부른다. E2E처럼 날짜를 고정해야 할 때만 DAYPLAY_TODAY(YYYY-MM-DD)를 쓰고, 형식이 틀리면 무시한다.
export function todayKey() {
  const fixed = process.env.DAYPLAY_TODAY;
  return fixed && /^\d{4}-\d{2}-\d{2}$/.test(fixed) ? fixed : toKstDateKey(new Date());
}
