import { expect, test, type Page } from "@playwright/test";

// 2026-09-28(DAYPLAY_TODAY)은 10초 맞추기가 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const board = (page: Page, name: RegExp) => section(page).getByRole("button", { name });
const startBoard = (page: Page) => board(page, /^10초 맞추기 시작/);
const runningBoard = (page: Page) => board(page, /^시간이 흐르고 있어요/);
const hiddenBoard = (page: Page) => board(page, /^시간을 가렸어요/);
const resultBoard = (page: Page) => board(page, /^결과 /);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("시작하면 처음에는 시간이 보이고 3초 뒤 가려지며, 누르면 멈춘 시각이 결과로 나온다", async ({
  page,
}) => {
  await startBoard(page).click();
  await expect(runningBoard(page)).toBeVisible();
  await expect(runningBoard(page)).toContainText(/\d\.\d{3}초/);

  await expect(hiddenBoard(page)).toBeVisible({ timeout: 5000 });
  await expect(hiddenBoard(page)).toContainText("?.???초");
  await hiddenBoard(page).click();

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 \d+\.\d{3}초\./);
  const myBest = page.getByRole("complementary").getByRole("region", { name: "내 최고 기록" });
  await expect(myBest).toContainText(/±\d+\.\d{3}초/);
});

test("시간이 보이는 동안 눌러도 멈춘다", async ({ page }) => {
  await startBoard(page).click();
  await expect(runningBoard(page)).toBeVisible();
  await runningBoard(page).click();

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 \d+\.\d{3}초\./);
});

test("스페이스바로 시작하고 멈춘다", async ({ page }) => {
  await startBoard(page).focus();
  await page.keyboard.press("Space");
  await expect(runningBoard(page)).toBeFocused();
  await page.keyboard.press("Space");

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 \d+\.\d{3}초\./);
});

test("20초 안에 멈추지 않으면 무효 결과 -로 끝난다", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await startBoard(page).click();
  await expect(runningBoard(page)).toBeVisible();

  await page.clock.runFor(21_000);

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 -\./);
});
