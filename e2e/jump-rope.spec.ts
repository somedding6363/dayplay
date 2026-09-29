import { expect, test, type Page } from "@playwright/test";

// 2026-09-26(DAYPLAY_TODAY)은 토요일이라 줄넘기만 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const jumpButton = (page: Page) => section(page).getByRole("button", { name: "점프", exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("점프 버튼과 넘은 횟수가 보이고, 뛰지 않으면 줄에 걸려 끝난다", async ({ page }) => {
  await startButton(page).click();
  await expect(section(page)).toContainText("0번");
  await expect(jumpButton(page)).toHaveAttribute("aria-keyshortcuts", "Space ArrowUp");
  await expect(jumpButton(page)).toHaveAttribute("draggable", "false");

  await expect(section(page)).toContainText("줄에 걸렸어요", { timeout: 10_000 });
  await expect(restartButton(page)).toBeVisible();
});
