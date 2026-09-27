import type { FinishPlayResult } from "../api/play-actions";

export type SaveState =
  | { status: "saving" }
  | { status: "failed" }
  // 비로그인. 이 브라우저에 저장했다.
  | { status: "local" }
  | FinishPlayResult;

export function saveMessage(state: SaveState, format: (result: unknown) => string) {
  switch (state.status) {
    case "saving":
      return "기록을 저장하는 중이에요.";
    case "local":
    case "signed-out":
      return "이 기기에 저장했어요. 로그인하면 계정에 저장돼요.";
    case "saved":
      return state.improved
        ? `오늘 내 기록이에요. 오늘 ${state.attempts}번째 play예요.`
        : `오늘 내 기록은 ${format(state.best.rawResult)}이에요. 오늘 ${state.attempts}번째 play예요.`;
    case "rejected":
    case "failed":
      return "기록을 저장하지 못했어요.";
  }
}
