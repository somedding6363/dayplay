import type { GameColor } from "@/widgets/daily-game";

interface MockGameMeta {
  name: string;
  instruction: string;
  color: GameColor;
}

// 게임 정의(features/games)가 없는 게임의 이름, 안내, 색을 대신한다. 새 게임의 안내와 색은 임시 값이다.
export const mockGameMeta: Record<string, MockGameMeta> = {
  "ten-seconds": {
    name: "10초 맞추기",
    instruction: "정확히 10초에 멈추세요.",
    color: { color: "#4F7FD6", soft: "#E3ECFB", mid: "#B9CDF1", ink: "#22467A" },
  },
  "odd-color": {
    name: "다른 색상 찾기",
    instruction: "색이 다른 칸을 찾으세요.",
    color: { color: "#8B6BD6", soft: "#ECE6FA", mid: "#CDBEF0", ink: "#45307A" },
  },
  "typing-sprint": {
    name: "타이핑 스프린트",
    instruction: "문장을 빠르고 정확하게 입력하세요.",
    color: { color: "#2E9C94", soft: "#DDF2F0", mid: "#A6DAD5", ink: "#17544F" },
  },
  "fake-letter": {
    name: "가짜 글자 찾기",
    instruction: "잘못 쓰인 글자를 찾으세요.",
    color: { color: "#D69A2E", soft: "#FBF0DA", mid: "#F0D39D", ink: "#6E4A0E" },
  },
  "stair-climb": {
    name: "계단 오르기",
    instruction: "방향을 바꿔 가며 계단을 오르세요.",
    color: { color: "#3F9A6B", soft: "#DDF1E6", mid: "#A9D8BE", ink: "#1E5A3E" },
  },
  "coin-flip": {
    name: "동전 앞뒤 맞추기",
    instruction: "앞면일지 뒷면일지 고르세요.",
    color: { color: "#D4537E", soft: "#FBE6EE", mid: "#F2BED1", ink: "#7A2444" },
  },
  racing: {
    name: "레이싱",
    instruction: "장애물을 피해 끝까지 달리세요.",
    color: { color: "#D9483B", soft: "#FBE3E0", mid: "#F2B8B1", ink: "#7E2219" },
  },
};
