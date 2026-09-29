import type { GameDefinition } from "@/entities/game";
import { racingRules, type RacingResult } from "./model/rules";
import { RacingGame } from "./ui/RacingGame";

export const racing: GameDefinition<RacingResult> = {
  ...racingRules,
  Component: RacingGame,
};
