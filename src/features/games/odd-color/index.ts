import type { GameDefinition } from "@/entities/game";
import { oddColorRules, type OddColorResult } from "./model/rules";
import { OddColorGame } from "./ui/OddColorGame";

export const oddColor: GameDefinition<OddColorResult> = {
  ...oddColorRules,
  Component: OddColorGame,
};
