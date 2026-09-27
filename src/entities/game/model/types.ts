// 결과 값이 작을수록 좋은지 클수록 좋은지. 순위와 내 기록 비교가 이 방향을 따른다.
export type Better = "lower" | "higher";

export interface GameColor {
  color: string;
  soft: string;
  mid: string;
  ink: string;
}

// 서버가 결과를 검증하고 비교 값을 다시 계산할 때 쓰는 규칙. React를 import하지 않는 파일에 구현한다.
export interface GameRules<TResult> {
  // kebab-case, 변경 금지. 기록과 일정이 이 값을 참조한다.
  id: string;
  name: string;
  instruction: string;
  color: GameColor;
  // 형식과 값 범위를 검증한다. 불가능한 값이면 null.
  parseResult: (input: unknown) => TResult | null;
  // 비교·정렬에 쓰는 정수. 결과 그대로의 값(ms 등)이다. 무효 결과는 null이다.
  toValue: (result: TResult) => number | null;
  better: Better;
  // 저장된 값만 받을 때(로그인 직후 병합) 범위를 검증한다. 무효(null)는 항상 받는다.
  isValidValue: (value: number) => boolean;
  // play에 걸린 시간(ms). 게임마다 재는 구간이 달라 게임이 결과에서 계산한다.
  // 서버는 이 값이 토큰 발급 후 실제로 지난 시간보다 길면 거부한다.
  durationMs: (result: TResult) => number;
  // value 기준 분포 구간. 무효(null)는 분포에 넣지 않는다.
  distribution: { min: number; max: number; bins: number; labels: [start: string, end: string] };
  // 방금 끝낸 play를 게임 판에 보여준다.
  formatResult: (result: TResult) => string;
  // 저장된 값만으로 보여준다. 내 최고 기록, 순위에 쓴다. 무효는 "-".
  formatValue: (value: number | null) => string;
}
