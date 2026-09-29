import type { GameDefinition } from "@/entities/game";
import { jumpRopeRules, type JumpRopeResult } from "./model/rules";
import { JumpRopeGame } from "./ui/JumpRopeGame";
import { Thumbnail } from "./ui/Thumbnail";

export const jumpRope: GameDefinition<JumpRopeResult> = {
  ...jumpRopeRules,
  Component: JumpRopeGame,
  Thumbnail,
};
