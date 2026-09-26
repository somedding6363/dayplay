export interface GameColor {
  color: string;
  soft: string;
  mid: string;
  ink: string;
}

export interface TodayGame {
  gameId: string;
  name: string;
  instruction: string;
  color: GameColor;
}
