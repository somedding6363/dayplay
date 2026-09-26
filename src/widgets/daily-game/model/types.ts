export interface GameColor {
  color: string;
  soft: string;
  mid: string;
  ink: string;
}

export interface TodayGame {
  gameId: string;
  kind: "week" | "cycle";
  round: number;
  name: string;
  instruction: string;
  color: GameColor;
}
