import type { GameDefinition } from "@/entities/game";
import { fakeLetterRules, type FakeLetterResult } from "./model/rules";
import { FakeLetterGame } from "./ui/FakeLetterGame";

export const fakeLetter: GameDefinition<FakeLetterResult> = {
  ...fakeLetterRules,
  Component: FakeLetterGame,
};
