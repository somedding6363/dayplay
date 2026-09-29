import type { GameDefinition } from "@/entities/game";
import { paperPlaneRules, type PaperPlaneResult } from "./model/rules";
import { PaperPlaneGame } from "./ui/PaperPlaneGame";

export const paperPlane: GameDefinition<PaperPlaneResult> = {
  ...paperPlaneRules,
  Component: PaperPlaneGame,
};
