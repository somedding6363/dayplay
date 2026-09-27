import type { GameColor } from "@/entities/game";

export interface TodayGame {
  gameId: string;
  name: string;
  instruction: string;
  color: GameColor;
}
