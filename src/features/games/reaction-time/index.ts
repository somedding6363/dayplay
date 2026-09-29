import type { GameDefinition } from "@/entities/game";
import { reactionTimeRules, type ReactionTimeResult } from "./model/rules";
import { ReactionTimeGame } from "./ui/ReactionTimeGame";
import { Thumbnail } from "./ui/Thumbnail";

export const reactionTime: GameDefinition<ReactionTimeResult> = {
  ...reactionTimeRules,
  Component: ReactionTimeGame,
  Thumbnail,
};
