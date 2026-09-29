import { expect, test, type Page } from "@playwright/test";

// 2026-09-21(DAYPLAY_TODAY)은 월요일이라 다른 색상 찾기가 첫 탭으로 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });
// 결과를 보여주는 판. 판 자체는 버튼이 아니고, 아래쪽 버튼으로 다시 시작한다.
const resultPanel = (page: Page) => section(page).locator('[aria-live="polite"]');
const grid = (page: Page, level: number) =>
  section(page).getByRole("group", { name: new RegExp(`^${level}단계`) });

// 색이 하나만 다른 칸의 순서. 화면에서 보이는 색으로 찾는다.
async function oddTileIndex(page: Page, level: number) {
  return grid(page, level)
    .getByRole("button")
    .evaluateAll((tiles) => {
      const colors = tiles.map((tile) => getComputedStyle(tile).backgroundColor);
      return colors.findIndex((color) => colors.filter((other) => other === color).length === 1);
    });
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("다른 칸을 누르면 격자가 커지며 다음 단계로 가고, 틀린 칸을 누르면 끝난다", async ({
  page,
}) => {
  await startButton(page).click();

  for (const [level, size] of [
    [1, 2],
    [2, 3],
    [3, 4],
  ]) {
    await expect(grid(page, level)).toHaveAccessibleName(new RegExp(`${size}×${size}`));
    await expect(grid(page, level).getByRole("button")).toHaveCount(size * size);
    const odd = await oddTileIndex(page, level);
    expect(odd).toBeGreaterThanOrEqual(0);
    // 결과 검증은 한 칸에 100ms보다 빨리 찾은 결과를 거부한다. 자동화 입력은 그보다 빨라서 사람처럼 쉰다.
    await page.waitForTimeout(150);
    await grid(page, level).getByRole("button").nth(odd).click();
  }

  const odd = await oddTileIndex(page, 4);
  await grid(page, 4)
    .getByRole("button")
    .nth(odd === 0 ? 1 : 0)
    .click();
  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText(/\d+개/);
});

test("화살표로 칸을 옮기고 Enter로 고른다", async ({ page }) => {
  await startButton(page).click();
  await expect(grid(page, 1)).toBeVisible();
  const odd = await oddTileIndex(page, 1);
  // 2×2에서 첫 칸(0)부터 오른쪽·아래로 옮겨 다른 칸까지 간다.
  if (odd % 2 === 1) await page.keyboard.press("ArrowRight");
  if (odd >= 2) await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(grid(page, 2)).toBeVisible();
});

test("한 단계에서 15초 안에 찾지 못하면 그때까지 찾은 개수로 끝난다", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await startButton(page).click();
  await expect(grid(page, 1)).toBeVisible();

  await page.clock.runFor(14_000);
  await expect(grid(page, 1)).toBeVisible();
  await page.clock.runFor(2_000);

  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText(/\d+개/);
});
