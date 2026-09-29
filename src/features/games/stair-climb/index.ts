import type { GameDefinition } from "@/entities/game";
import { stairClimbRules, type StairClimbResult } from "./model/rules";
import { StairClimbGame } from "./ui/StairClimbGame";
import { Thumbnail } from "./ui/Thumbnail";

export const stairClimb: GameDefinition<StairClimbResult> = {
  ...stairClimbRules,
  Component: StairClimbGame,
  Thumbnail,
};
