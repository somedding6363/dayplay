import { expect, test, type Page } from "@playwright/test";

// 2026-09-27(DAYPLAY_TODAY)은 일요일이라 동전 앞뒤 맞추기만 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const headsButton = (page: Page) =>
  section(page).getByRole("button", { name: "앞면", exact: true });
const tailsButton = (page: Page) =>
  section(page).getByRole("button", { name: "뒷면", exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });
const resultPanel = (page: Page) => section(page).locator('[aria-live="polite"]').first();

test.beforeEach(async ({ page }) => {
  // 동전이 늘 앞면으로 나오게 해서 흐름을 확인한다.
  await page.addInitScript(() => {
    Math.random = () => 0.1;
  });
  await page.goto("/");
});

test("맞히면 연속 횟수가 늘고, 틀리면 나온 면을 보여준 뒤 끝난다", async ({ page }) => {
  await startButton(page).click();

  for (let streak = 1; streak <= 3; streak += 1) {
    await headsButton(page).click();
    await expect(section(page)).toContainText(`맞혔어요! ${streak}연속`);
  }

  await tailsButton(page).click();
  await expect(section(page)).toContainText("앞면이었어요.");
  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText("3연속");
});

test("동전이 도는 동안 다시 눌러도 한 번만 던진다", async ({ page }) => {
  await startButton(page).click();
  await headsButton(page).click();
  await headsButton(page).click();

  await expect(section(page)).toContainText("맞혔어요! 1연속");
  await page.waitForTimeout(800);
  await expect(section(page)).toContainText("맞혔어요! 1연속");
});

test("← 앞면, → 뒷면 키로 고른다", async ({ page }) => {
  await startButton(page).click();
  await expect(headsButton(page)).toHaveAttribute("aria-keyshortcuts", "ArrowLeft");
  await expect(tailsButton(page)).toHaveAttribute("aria-keyshortcuts", "ArrowRight");

  await page.keyboard.press("ArrowLeft");
  await expect(section(page)).toContainText("맞혔어요! 1연속");
  await page.keyboard.press("ArrowRight");
  await expect(restartButton(page)).toBeVisible();
});
