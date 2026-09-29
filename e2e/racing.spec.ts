import { expect, test, type Page } from "@playwright/test";

// 2026-10-11(DAYPLAY_TODAY)은 일요일이라 레이싱만 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const control = (page: Page, name: string) =>
  section(page).getByRole("button", { name, exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("조작 버튼과 바퀴 수가 보이고, 악셀을 누르고 벽에 막혀도 끝나지 않는다", async ({ page }) => {
  await startButton(page).click();
  await expect(section(page)).toContainText("1/3바퀴");
  await expect(control(page, "왼쪽")).toHaveAttribute("aria-keyshortcuts", "ArrowLeft");
  await expect(control(page, "오른쪽")).toHaveAttribute("aria-keyshortcuts", "ArrowRight");
  await expect(control(page, "후진")).toHaveAttribute("aria-keyshortcuts", "ArrowDown");
  await expect(control(page, "악셀")).toHaveAttribute("aria-keyshortcuts", "ArrowUp Space");

  const labels = await section(page)
    .getByRole("button")
    .filter({ hasText: /^(왼쪽|후진|악셀|오른쪽)/ })
    .allInnerTexts();
  expect(labels.map((label) => label.split(/\s/)[0])).toEqual(["왼쪽", "오른쪽", "후진", "악셀"]);
  await expect(control(page, "악셀")).toHaveAttribute("draggable", "false");

  // 출발 직선에서 오른쪽으로 꺾으며 달리면 곧 벽에 막힌다.
  await page.keyboard.down("ArrowUp");
  await page.keyboard.down("ArrowRight");
  await expect(section(page)).toContainText("벽에 막혔어요", { timeout: 10_000 });
  await page.keyboard.up("ArrowRight");
  await page.keyboard.up("ArrowUp");
  await expect(restartButton(page)).toBeHidden();
  await expect(section(page)).toContainText("1/3바퀴");
});
