import type { ComponentType } from "react";
import type { GameRules } from "./types";

export interface GameProps<TResult> {
  // 무효도 결과다. 게임은 play가 끝나면 한 번만 부른다.
  onFinish: (result: TResult) => void;
}

// 게임 feature가 공개하는 정의. 서버는 GameRules 부분만 쓴다.
export interface GameDefinition<TResult> extends GameRules<TResult> {
  // 마운트되면 바로 play를 시작한다. 시작 전과 끝난 뒤의 게임 판은 플랫폼이 그린다.
  Component: ComponentType<GameProps<TResult>>;
  // 시작·결과 판 전체에 까는 그림. 게임 색 token으로 칠해 게임마다 자기 색으로 보인다.
  Thumbnail: ComponentType;
}
