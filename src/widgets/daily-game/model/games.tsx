import type { ComponentType } from "react";
import type { Better, GameDefinition, GameRules } from "@/entities/game";
import { coinFlip } from "@/features/games/coin-flip";
import { oddColor } from "@/features/games/odd-color";
import { reactionTime } from "@/features/games/reaction-time";
import { stairClimb } from "@/features/games/stair-climb";
import { tenSeconds } from "@/features/games/ten-seconds";
import type { TodayGame } from "./types";

// 게임마다 결과 타입이 달라서 등록부에는 결과 타입을 감춘 모양으로 담는다.
export interface PlayableGame extends TodayGame {
  Component: ComponentType<{ onFinish: (result: unknown) => void }>;
  // 방금 끝낸 결과를 게임 판에 보여줄 문자열로 바꾼다. 읽지 못하면 "-".
  format: (result: unknown) => string;
  // 저장된 값만으로 보여준다. 내 최고 기록과 저장 안내에 쓴다.
  formatValue: (value: number | null) => string;
  // 결과를 내 기록 비교에 쓰는 값으로 바꾼다. 읽지 못하거나 무효면 null.
  value: (result: unknown) => number | null;
  better: Better;
  distribution: GameRules<unknown>["distribution"];
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
    formatValue: game.formatValue,
    distribution: game.distribution,
  };
}

export const playableGames = new Map(
  [
    toPlayable(reactionTime),
    toPlayable(tenSeconds),
    toPlayable(oddColor),
    toPlayable(stairClimb),
    toPlayable(coinFlip),
  ].map((game) => [game.gameId, game]),
);
