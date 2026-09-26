import type { TodayGame } from "@/widgets/daily-game";

// 일정 로직이 생기기 전까지 화면 틀을 잡기 위한 mock 데이터다.
export const mockTodayGames: TodayGame[] = [
  {
    gameId: "reaction-time",
    kind: "week",
    round: 12,
    name: "반응속도",
    instruction: "색이 바뀌면 누르세요.",
    color: { color: "#E4704F", soft: "#FBE6DD", mid: "#F3C3B1", ink: "#8A3A22" },
  },
  {
    gameId: "ten-seconds",
    kind: "cycle",
    round: 3,
    name: "10초 맞추기",
    instruction: "정확히 10초에 멈추세요.",
    color: { color: "#4F7FD6", soft: "#E3ECFB", mid: "#B9CDF1", ink: "#22467A" },
  },
];
