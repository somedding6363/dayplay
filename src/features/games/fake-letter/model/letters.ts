// 격자를 채우는 진짜 글자와, 한 칸에만 섞는 비슷한 가짜 글자.
// 단계가 오를수록 차이가 덜 눈에 띄는 묶음에서 고른다. 난이도는 직접 해 보며 정했다. 모두 KS X 1001 완성형이라 어떤 글꼴에서도 보인다.
export const letterPairs: [string, string][][] = [
  // 쉬움(1~3단계). 차이가 비교적 한눈에 보인다.
  [
    ["쇠", "쐬"],
    ["봄", "봉"],
    ["왜", "웨"],
    ["달", "돌"],
    ["산", "선"],
    ["밤", "범"],
    ["물", "불"],
    ["강", "공"],
    ["괴", "귀"],
    ["값", "갑"],
    ["집", "짐"],
    ["갓", "갔"],
    ["길", "걸"],
    ["맑", "많"],
    ["창", "총"],
  ],
  // 중간(4~7단계)
  [
    ["빛", "빚"],
    ["낮", "낯"],
    ["꽃", "꽂"],
    ["방", "빙"],
    ["앉", "않"],
    ["밝", "밟"],
    ["흙", "흘"],
    ["넋", "넓"],
    ["몫", "목"],
    ["닭", "닮"],
    ["손", "순"],
    ["옷", "옻"],
    ["낱", "낟"],
    ["잎", "입"],
    ["읽", "잃"],
    ["잠", "좀"],
  ],
  // 어려움(8단계부터). 차이가 가장 눈에 띄지 않는다.
  [
    ["게", "계"],
    ["애", "얘"],
    ["곰", "곤"],
    ["몽", "뭉"],
    ["뼈", "뻐"],
    ["텔", "탤"],
    ["괘", "궤"],
    ["돼", "되"],
    ["네", "내"],
    ["세", "새"],
    ["레", "래"],
    ["페", "패"],
    ["테", "태"],
    ["개", "걔"],
    ["쇄", "쉐"],
    ["말", "멀"],
    ["눈", "논"],
  ],
];

// 폰에서 글자가 너무 작아지지 않도록 6×6에서 멈춘다.
export const MAX_GRID_SIZE = 6;

// 1·2단계 3×3, 3·4단계 4×4, … 7단계부터 6×6. 단계는 끝이 없다.
export function gridSize(level: number) {
  return Math.min(MAX_GRID_SIZE, 2 + Math.ceil(level / 2));
}

// 1~3단계 쉬운 묶음, 4~7단계 중간 묶음, 8단계부터 어려운 묶음
export function tierOf(level: number) {
  if (level <= 3) return 0;
  return level <= 7 ? 1 : 2;
}

export interface Puzzle {
  real: string;
  fake: string;
  // 가짜 글자가 있는 칸
  fakeIndex: number;
}

// 난이도 묶음은 단계로만 정해져 누구나 같고, 묶음 안의 글자·진짜와 가짜의 순서·위치만 무작위다(D-12).
// 바로 앞 단계에 나온 글자가 하나라도 들어 있는 묶음은 고르지 않아 같은 글자가 연속으로 나오지 않는다.
export function makePuzzle(level: number, previous?: Puzzle, random = Math.random): Puzzle {
  const seen = new Set(previous ? [previous.real, previous.fake] : []);
  const pairs = letterPairs[tierOf(level)].filter(([a, b]) => !seen.has(a) && !seen.has(b));
  const [a, b] = pairs[Math.floor(random() * pairs.length)];
  const [real, fake] = random() < 0.5 ? [a, b] : [b, a];
  const size = gridSize(level);
  return { real, fake, fakeIndex: Math.floor(random() * size * size) };
}
