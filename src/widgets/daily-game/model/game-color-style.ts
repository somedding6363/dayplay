import type { CSSProperties } from "react";
import type { TodayGame } from "./types";

type GameColorStyle = CSSProperties & Record<`--game-${string}`, string>;

export function gameColorStyle(game: TodayGame): GameColorStyle {
  return {
    "--game-color": game.color.color,
    "--game-soft": game.color.soft,
    "--game-mid": game.color.mid,
    "--game-ink": game.color.ink,
  };
}
