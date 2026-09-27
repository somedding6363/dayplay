const adjectives = [
  "빠른",
  "조용한",
  "반짝이는",
  "용감한",
  "느긋한",
  "졸린",
  "배고픈",
  "신나는",
  "새벽의",
  "푸른",
  "작은",
  "든든한",
  "몰래",
  "씩씩한",
  "엉뚱한",
  "상냥한",
];
const nouns = [
  "고양이",
  "여우",
  "펭귄",
  "수달",
  "다람쥐",
  "고래",
  "부엉이",
  "판다",
  "햄스터",
  "토끼",
  "거북이",
  "너구리",
  "알파카",
  "참새",
  "코알라",
  "강아지",
];

export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 12;
const nicknamePattern = new RegExp(`^[가-힣a-zA-Z0-9]{${NICKNAME_MIN},${NICKNAME_MAX}}$`);

// random은 테스트에서 고정값을 넣으려고 받는다.
export function generateNickname(random: () => number = Math.random) {
  const pick = <T>(items: T[]) => items[Math.floor(random() * items.length)];
  const number = String(Math.floor(random() * 100)).padStart(2, "0");
  return `${pick(adjectives)}${pick(nouns)}${number}`;
}

export type NicknameError = "length" | "characters";

export function validateNickname(nickname: string): NicknameError | null {
  if (nickname.length < NICKNAME_MIN || nickname.length > NICKNAME_MAX) {
    return "length";
  }
  return nicknamePattern.test(nickname) ? null : "characters";
}
