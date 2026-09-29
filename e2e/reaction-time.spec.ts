import { expect, test, type Page } from "@playwright/test";

// 2026-09-29(DAYPLAY_TODAY)은 반응속도가 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const board = (page: Page, name: RegExp) => section(page).getByRole("button", { name });
const waitingBoard = (page: Page) => board(page, /^기다리세요/);
const signalBoard = (page: Page) => board(page, /^지금 누르세요/);
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });
// 결과를 보여주는 판. 판 자체는 버튼이 아니고, 아래쪽 버튼으로 다시 시작한다.
const resultPanel = (page: Page) => section(page).locator('[aria-live="polite"]');

// 자동화 입력은 신호 프레임이 그려지기 전에 누르면 신호 전 입력(무효)이 될 수 있다.
const humanDelay = (page: Page) => page.waitForTimeout(200);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("시작하면 기다리고, 신호 후 누르면 ms 결과가 나온다", async ({ page }) => {
  await startButton(page).click();
  await expect(waitingBoard(page)).toBeVisible();

  await expect(signalBoard(page)).toBeVisible({ timeout: 6000 });
  await humanDelay(page);
  await signalBoard(page).click();

  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText(/\d+ms/);
  await expect(section(page).getByRole("button", { name: "로그인하고 기록 저장" })).toBeVisible();
});

test("비로그인 기록은 내 최고 기록에 바로 보이고 새로고침해도 남는다", async ({ page }) => {
  const myBest = page.getByRole("complementary").getByRole("region", { name: "내 최고 기록" });
  await expect(myBest).toContainText("게임을 끝내면 여기에 기록이 남아요.");

  await startButton(page).click();
  await waitingBoard(page).click();
  await expect(resultPanel(page)).toBeVisible();
  await expect(myBest).toContainText("-");
  await expect(myBest).toContainText("이 기기");

  await page.reload();
  await expect(myBest).toContainText("-");
  await expect(myBest).toContainText("이 기기");
});

test("비로그인으로 여러 번 하면 그날 그 게임의 한 기록에 횟수가 쌓인다", async ({ page }) => {
  for (let i = 0; i < 2; i += 1) {
    await (i === 0 ? startButton(page) : restartButton(page)).click();
    await waitingBoard(page).click();
    await expect(restartButton(page)).toBeVisible();
  }

  const records = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("dayplay:records:v4") ?? "[]"),
  );
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ gameId: "reaction-time", attempts: 2 });
});

test("신호 전에 누르면 무효 결과 -로 끝난다", async ({ page }) => {
  await startButton(page).click();
  await waitingBoard(page).click();

  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText(/-/);
});

test("스페이스바로 시작하고 반응한다", async ({ page }) => {
  await startButton(page).focus();
  await page.keyboard.press("Space");
  await expect(waitingBoard(page)).toBeFocused();

  await expect(signalBoard(page)).toBeVisible({ timeout: 6000 });
  await humanDelay(page);
  await page.keyboard.press("Space");

  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText(/\d+ms/);
  await expect(resultPanel(page)).toBeFocused();
});

test("결과 판을 누르거나 Space를 눌러도 다시 시작하지 않고, 다시 하기 버튼으로만 다시 시작한다", async ({
  page,
}) => {
  await startButton(page).click();
  await waitingBoard(page).click();
  await expect(restartButton(page)).toBeVisible();

  // 게임이 끝나는 순간에도 계속 누르던 입력이 다시 시작으로 이어지지 않는다.
  await resultPanel(page).click({ position: { x: 20, y: 20 } });
  await page.keyboard.press("Space");
  await page.keyboard.press("Enter");
  await expect(restartButton(page)).toBeVisible();

  await restartButton(page).click();
  await expect(waitingBoard(page)).toBeVisible();
});

test("탭을 벗어나면 무효로 끝난다", async ({ page }) => {
  await startButton(page).click();
  await expect(waitingBoard(page)).toBeVisible();

  await page.evaluate(() => {
    Object.defineProperty(document, "visibilityState", { value: "hidden", configurable: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText(/-/);
});
