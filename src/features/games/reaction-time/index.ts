import type { GameDefinition } from "@/entities/game";
import { reactionTimeRules, type ReactionTimeResult } from "./model/rules";
import { ReactionTimeGame } from "./ui/ReactionTimeGame";

export const reactionTime: GameDefinition<ReactionTimeResult> = {
  ...reactionTimeRules,
  Component: ReactionTimeGame,
};
