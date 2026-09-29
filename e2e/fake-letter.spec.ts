import { expect, test, type Page } from "@playwright/test";

// 2026-09-24(DAYPLAY_TODAY)은 목요일이라 가짜 글자 찾기가 첫 탭으로 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });
const resultPanel = (page: Page) => section(page).locator('[aria-live="polite"]');
const grid = (page: Page, level: number) =>
  section(page).getByRole("group", { name: new RegExp(`^${level}단계`) });

// 글자가 하나만 다른 칸의 순서
async function fakeTileIndex(page: Page, level: number) {
  return grid(page, level)
    .getByRole("button")
    .evaluateAll((tiles) => {
      const letters = tiles.map((tile) => tile.textContent);
      return letters.findIndex(
        (letter) => letters.filter((other) => other === letter).length === 1,
      );
    });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("가짜 글자를 누르면 격자가 커지며 다음 단계로 가고, 틀리면 가짜 글자를 보여준 뒤 끝난다", async ({
  page,
}) => {
  await startButton(page).click();

  for (const [level, size] of [
    [1, 3],
    [2, 3],
    [3, 4],
  ]) {
    await expect(grid(page, level)).toHaveAccessibleName(new RegExp(`${size}×${size}`));
    await expect(grid(page, level).getByRole("button")).toHaveCount(size * size);
    const fake = await fakeTileIndex(page, level);
    expect(fake).toBeGreaterThanOrEqual(0);
    // 결과 검증은 한 칸에 150ms보다 빨리 찾은 결과를 거부한다. 자동화 입력은 그보다 빨라서 사람처럼 쉰다.
    await page.waitForTimeout(200);
    await grid(page, level).getByRole("button").nth(fake).click();
  }

  const fake = await fakeTileIndex(page, 4);
  await grid(page, 4)
    .getByRole("button")
    .nth(fake === 0 ? 1 : 0)
    .click();
  await expect(section(page)).toContainText("다른 글자예요");
  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText("3개");
});

test("화살표로 칸을 옮기고 Enter로 고른다", async ({ page }) => {
  await startButton(page).click();
  await expect(grid(page, 1)).toBeVisible();
  const fake = await fakeTileIndex(page, 1);
  // 3×3에서 첫 칸(0)부터 오른쪽·아래로 옮겨 가짜 글자 칸까지 간다.
  for (let i = 0; i < fake % 3; i += 1) await page.keyboard.press("ArrowRight");
  for (let i = 0; i < Math.floor(fake / 3); i += 1) await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  await expect(grid(page, 2)).toBeVisible();
});
