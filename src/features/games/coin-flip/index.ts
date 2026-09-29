import type { GameDefinition } from "@/entities/game";
import { coinFlipRules, type CoinFlipResult } from "./model/rules";
import { CoinFlipGame } from "./ui/CoinFlipGame";
import { Thumbnail } from "./ui/Thumbnail";

export const coinFlip: GameDefinition<CoinFlipResult> = {
  ...coinFlipRules,
  Component: CoinFlipGame,
  Thumbnail,
};
