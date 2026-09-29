import type { GameDefinition } from "@/entities/game";
import { poopDodgeRules, type PoopDodgeResult } from "./model/rules";
import { PoopDodgeGame } from "./ui/PoopDodgeGame";
import { Thumbnail } from "./ui/Thumbnail";

export const poopDodge: GameDefinition<PoopDodgeResult> = {
  ...poopDodgeRules,
  Component: PoopDodgeGame,
  Thumbnail,
};
