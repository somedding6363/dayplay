import type { GameDefinition } from "@/entities/game";
import { tenSecondsRules, type TenSecondsResult } from "./model/rules";
import { TenSecondsGame } from "./ui/TenSecondsGame";
import { Thumbnail } from "./ui/Thumbnail";

export const tenSeconds: GameDefinition<TenSecondsResult> = {
  ...tenSecondsRules,
  Component: TenSecondsGame,
  Thumbnail,
};
