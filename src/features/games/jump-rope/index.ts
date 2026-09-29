import type { GameDefinition } from "@/entities/game";
import { jumpRopeRules, type JumpRopeResult } from "./model/rules";
import { JumpRopeGame } from "./ui/JumpRopeGame";

export const jumpRope: GameDefinition<JumpRopeResult> = {
  ...jumpRopeRules,
  Component: JumpRopeGame,
};
