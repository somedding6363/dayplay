import type { GameDefinition } from "@/entities/game";
import { poopDodgeRules, type PoopDodgeResult } from "./model/rules";
import { PoopDodgeGame } from "./ui/PoopDodgeGame";

export const poopDodge: GameDefinition<PoopDodgeResult> = {
  ...poopDodgeRules,
  Component: PoopDodgeGame,
};
