import { expect, test, type Page } from "@playwright/test";

// 2026-10-04(DAYPLAY_TODAY)은 일요일이라 똥피하기만 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const control = (page: Page, name: string) =>
  section(page).getByRole("button", { name, exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("왼쪽·오른쪽 버튼이 보이고, 가만히 있으면 똥에 맞아 끝난다", async ({ page }) => {
  await startButton(page).click();
  await expect(control(page, "왼쪽")).toHaveAttribute("aria-keyshortcuts", "ArrowLeft");
  await expect(control(page, "오른쪽")).toHaveAttribute("aria-keyshortcuts", "ArrowRight");
  await expect(control(page, "왼쪽")).toHaveAttribute("draggable", "false");

  await expect(section(page)).toContainText("똥에 맞았어요", { timeout: 15_000 });
  await expect(restartButton(page)).toBeVisible();
});
