import type { ComponentType } from "react";
import type { Better, GameDefinition } from "@/entities/game";
import { reactionTime } from "@/features/games/reaction-time";
import type { TodayGame } from "./types";

// 게임마다 결과 타입이 달라서 등록부에는 결과 타입을 감춘 모양으로 담는다.
export interface PlayableGame extends TodayGame {
  Component: ComponentType<{ onFinish: (result: unknown) => void }>;
  // 저장된 원본 결과를 표시용 문자열로 바꾼다. 읽지 못하면 "-".
  format: (result: unknown) => string;
  // 결과를 내 기록 비교에 쓰는 값으로 바꾼다. 읽지 못하거나 무효면 null.
  value: (result: unknown) => number | null;
  better: Better;
}

function toPlayable<TResult>(game: GameDefinition<TResult>): PlayableGame {
  const Game = game.Component;
  return {
    gameId: game.id,
    name: game.name,
    instruction: game.instruction,
    color: game.color,
    Component: function PlayableGameComponent({ onFinish }) {
      return <Game onFinish={onFinish} />;
    },
    format: (result) => {
      const parsed = game.parseResult(result);
      return parsed === null ? "-" : game.formatResult(parsed);
    },
    value: (result) => {
      const parsed = game.parseResult(result);
      return parsed === null ? null : game.toValue(parsed);
    },
    better: game.better,
  };
}

export const playableGames = new Map([toPlayable(reactionTime)].map((game) => [game.gameId, game]));
