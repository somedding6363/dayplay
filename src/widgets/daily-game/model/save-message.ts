import type { FinishPlayResult } from "../api/play-actions";

export type SaveState = { status: "saving" } | { status: "failed" } | FinishPlayResult;

export function saveMessage(state: SaveState, format: (result: unknown) => string) {
  switch (state.status) {
    case "saving":
      return "기록을 저장하는 중이에요.";
    case "signed-out":
      return "로그인하면 기록이 저장돼요.";
    case "saved":
      return state.improved
        ? `오늘 내 기록이에요. 오늘 ${state.attempts}번째 play예요.`
        : `오늘 내 기록은 ${format(state.best.rawResult)}이에요. 오늘 ${state.attempts}번째 play예요.`;
    case "rejected":
    case "failed":
      return "기록을 저장하지 못했어요.";
  }
}
