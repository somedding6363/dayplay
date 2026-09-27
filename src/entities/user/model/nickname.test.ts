import { describe, expect, it } from "vitest";
import { generateNickname, validateNickname } from "./nickname";

describe("generateNickname", () => {
  it("형용사 + 명사 + 두 자리 숫자로 만든다", () => {
    expect(generateNickname(() => 0)).toBe("빠른고양이00");
    expect(generateNickname(() => 0.999)).toBe("상냥한강아지99");
  });

  it("만든 닉네임은 항상 규칙을 통과한다", () => {
    for (let index = 0; index < 500; index += 1) {
      expect(validateNickname(generateNickname())).toBeNull();
    }
  });
});

describe("validateNickname", () => {
  it("2~12자의 한글, 영문, 숫자만 허용한다", () => {
    expect(validateNickname("두야")).toBeNull();
    expect(validateNickname("dayplay2026")).toBeNull();
    expect(validateNickname("가")).toBe("length");
    expect(validateNickname("가".repeat(13))).toBe("length");
    expect(validateNickname("두 야")).toBe("characters");
    expect(validateNickname("ㄱㄴ")).toBe("characters");
    expect(validateNickname("두야!")).toBe("characters");
  });
});
