import { expect, test, type Page } from "@playwright/test";

// 2026-09-25(DAYPLAY_TODAY)은 금요일이라 종이비행기만 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const control = (page: Page, name: string) =>
  section(page).getByRole("button", { name, exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("조작 버튼과 거리가 보이고, 누르지 않으면 떨어져 끝난다", async ({ page }) => {
  await startButton(page).click();
  await expect(section(page)).toContainText("m");
  await expect(control(page, "왼쪽")).toHaveAttribute("aria-keyshortcuts", "ArrowLeft");
  await expect(control(page, "오른쪽")).toHaveAttribute("aria-keyshortcuts", "ArrowRight");
  await expect(control(page, "띄우기")).toHaveAttribute("aria-keyshortcuts", "ArrowUp Space");
  await expect(control(page, "띄우기")).toHaveAttribute("draggable", "false");

  await expect(section(page)).toContainText("부딪혔어요", { timeout: 10_000 });
  await expect(restartButton(page)).toBeVisible();
});

test("스페이스바를 누르고 있으면 떠 있는 동안 거리가 늘어난다", async ({ page }) => {
  await startButton(page).click();
  await page.keyboard.down("Space");
  await expect(section(page)).toContainText(/[1-9]\d*m/);
  await page.keyboard.up("Space");
});
