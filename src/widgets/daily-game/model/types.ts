import type { GameColor } from "@/entities/game";

export type { GameColor };

export interface TodayGame {
  gameId: string;
  name: string;
  instruction: string;
  color: GameColor;
}
