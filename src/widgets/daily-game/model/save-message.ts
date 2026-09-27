import type { FinishPlayResult } from "../api/play-actions";

export type SaveState =
  | { status: "saving" }
  // 로그인하지 않았거나 세션이 만료돼 이 브라우저에 저장했다.
  | { status: "local" }
  // 로그인했지만 계정에 저장하지 못해 이 브라우저에 남겼다.
  | { status: "retry-later" }
  | Extract<FinishPlayResult, { status: "saved" }>;

export function saveMessage(state: SaveState, formatValue: (value: number | null) => string) {
  switch (state.status) {
    case "saving":
      return "기록을 저장하는 중이에요.";
    case "local":
      return "이 기기에 저장했어요. 로그인하면 계정에 저장돼요.";
    case "retry-later":
      return "지금은 저장하지 못해 이 기기에 남겼어요. 오늘 다시 들어오면 다시 저장해요.";
    case "saved":
      return state.improved
        ? `오늘 내 기록이에요. 오늘 ${state.attempts}번째 play예요.`
        : `오늘 내 기록은 ${formatValue(state.best)}이에요. 오늘 ${state.attempts}번째 play예요.`;
  }
}
