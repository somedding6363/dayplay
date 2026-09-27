export interface GameColor {
  color: string;
  soft: string;
  mid: string;
  ink: string;
}

// 서버가 결과를 검증하고 점수를 다시 계산할 때 쓰는 규칙. React를 import하지 않는 파일에 구현한다.
export interface GameRules<TResult> {
  // kebab-case, 변경 금지. 기록과 일정이 이 값을 참조한다.
  id: string;
  // 점수·검증 규칙을 바꾸면 올린다.
  version: number;
  name: string;
  instruction: string;
  color: GameColor;
  // 형식과 값 범위를 검증한다. 불가능한 값이면 null.
  parseResult: (input: unknown) => TResult | null;
  // 높을수록 좋은 정수. 낮을수록 좋은 값은 부호를 뒤집는다.
  toScore: (result: TResult) => number;
  measure: (result: TResult) => number;
  distribution: { min: number; max: number; bins: number; labels: [start: string, end: string] };
  formatResult: (result: TResult) => string;
  formatSummary: (result: TResult) => string;
}
