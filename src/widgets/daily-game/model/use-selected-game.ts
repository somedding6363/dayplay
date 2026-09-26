import { useState } from "react";
import type { TodayGame } from "./types";

export function useSelectedGame(games: TodayGame[]) {
  const [selectedId, setSelectedId] = useState(games[0]?.gameId);
  const selected = games.find((game) => game.gameId === selectedId) ?? games[0];

  return { selected, select: setSelectedId };
}
