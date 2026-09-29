import type { GameDefinition } from "@/entities/game";
import { fakeLetterRules, type FakeLetterResult } from "./model/rules";
import { FakeLetterGame } from "./ui/FakeLetterGame";
import { Thumbnail } from "./ui/Thumbnail";

export const fakeLetter: GameDefinition<FakeLetterResult> = {
  ...fakeLetterRules,
  Component: FakeLetterGame,
  Thumbnail,
};
