import { expect, test, type Page } from "@playwright/test";

// 2026-09-28(DAYPLAY_TODAY)은 반응속도가 첫 탭이다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const board = (page: Page, name: RegExp) => section(page).getByRole("button", { name });
const startBoard = (page: Page) => board(page, /^반응속도 시작/);
const waitingBoard = (page: Page) => board(page, /^기다리세요/);
const signalBoard = (page: Page) => board(page, /^지금 누르세요/);
const resultBoard = (page: Page) => board(page, /^결과 /);
const status = (page: Page) => section(page).getByRole("status");

// 자동화 입력은 신호 프레임이 그려지기 전에 누르면 신호 전 입력(무효)이 될 수 있다.
const humanDelay = (page: Page) => page.waitForTimeout(200);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("시작하면 기다리고, 신호 후 누르면 ms 결과가 나온다", async ({ page }) => {
  await startBoard(page).click();
  await expect(waitingBoard(page)).toBeVisible();

  await expect(signalBoard(page)).toBeVisible({ timeout: 6000 });
  await humanDelay(page);
  await signalBoard(page).click();

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 \d+ms\./);
  await expect(status(page)).toHaveText("이 기기에 저장했어요. 로그인하면 계정에 저장돼요.");
  await expect(section(page).getByRole("button", { name: "로그인하고 기록 저장" })).toBeVisible();
});

test("비로그인 기록은 내 최고 기록에 바로 보이고 새로고침해도 남는다", async ({ page }) => {
  const myBest = page.getByRole("complementary").getByRole("region", { name: "내 최고 기록" });
  await expect(myBest).toContainText("게임을 끝내면 여기에 기록이 남아요.");

  await startBoard(page).click();
  await waitingBoard(page).click();
  await expect(resultBoard(page)).toBeVisible();
  await expect(myBest).toContainText("-");
  await expect(myBest).toContainText("이 기기");

  await page.reload();
  await expect(myBest).toContainText("-");
  await expect(myBest).toContainText("이 기기");
});

test("신호 전에 누르면 무효 결과 -로 끝난다", async ({ page }) => {
  await startBoard(page).click();
  await waitingBoard(page).click();

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 -\./);
});

test("스페이스바로 시작하고 반응한다", async ({ page }) => {
  await startBoard(page).focus();
  await page.keyboard.press("Space");
  await expect(waitingBoard(page)).toBeFocused();

  await expect(signalBoard(page)).toBeVisible({ timeout: 6000 });
  await humanDelay(page);
  await page.keyboard.press("Space");

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 \d+ms\./);
  await expect(resultBoard(page)).toBeFocused();
});

test("끝낸 입력으로 바로 다시 시작하지 않고, 결과 판을 누르면 다시 시작한다", async ({ page }) => {
  await startBoard(page).click();
  await waitingBoard(page).click();
  await expect(resultBoard(page)).toBeVisible();

  // 끝낸 click이 결과 판에 이어 떨어져도 다시 시작하지 않는다.
  await page.waitForTimeout(300);
  await expect(resultBoard(page)).toBeVisible();

  await resultBoard(page).click();
  await expect(waitingBoard(page)).toBeVisible();
});

test("탭을 벗어나면 무효로 끝난다", async ({ page }) => {
  await startBoard(page).click();
  await expect(waitingBoard(page)).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await expect(resultBoard(page)).toHaveAccessibleName(/^결과 -\./);
});
