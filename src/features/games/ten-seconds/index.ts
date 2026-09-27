import type { GameDefinition } from "@/entities/game";
import { tenSecondsRules, type TenSecondsResult } from "./model/rules";
import { TenSecondsGame } from "./ui/TenSecondsGame";

export const tenSeconds: GameDefinition<TenSecondsResult> = {
  ...tenSecondsRules,
  Component: TenSecondsGame,
};
