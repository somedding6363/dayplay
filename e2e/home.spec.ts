import { expect, test, type Page } from "@playwright/test";

const gameSection = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const gameTabs = (page: Page) =>
  page.getByRole("list", { name: "오늘의 게임 목록" }).getByRole("button");
const gameBoard = (page: Page) => gameSection(page).getByRole("button", { name: /시작/ });

// 일정 데이터(게임 이름, 안내 문구)는 단위 테스트가 검사한다. 여기서는 화면 동작만 본다.
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

// 지금 일정은 week game 없이 cycle game만 있어 하루에 게임이 하나다. 두 개 이상 열리는 일정이 생기면 다시 검사한다.
async function skipUnlessSeveralGames(page: Page) {
  test.skip((await gameTabs(page).count()) < 2, "DAYPLAY_TODAY에 열린 게임이 하나뿐이다.");
}

test("첫 화면에 날짜, 게임 탭, 게임 판을 보여준다", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^\d+월 \d+일 .요일$/);
  await expect(page.getByText("게임은 매일 바뀌어요.")).toBeVisible();
  await expect(gameTabs(page).first()).toHaveAttribute("aria-pressed", "true");
  await expect(gameBoard(page)).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("duworks");
});

test("분포 막대에 올리거나 focus하면 구간 값과 인원을 겹쳐 보여준다", async ({ page }) => {
  const bars = page.getByRole("list", { name: /참가자 기록 분포/ }).getByRole("listitem");
  test.skip((await bars.count()) === 0, "E2E 서버의 DB에 이 게임 기록이 없다.");
  const overlay = bars.first().locator("span").last();

  await expect(overlay).toBeHidden();
  await bars.first().hover();
  await expect(overlay).toBeVisible();
  await expect(overlay).toHaveText(/미만 · \d+명/);

  await page.mouse.move(0, 0);
  await bars.last().focus();
  await expect(bars.last().locator("span").last()).toHaveText(/이상 · \d+명/);
});

test("오른쪽 영역에 내 최고 기록, 순위, 분포, 참가자를 보여준다", async ({ page }) => {
  const aside = page.getByRole("complementary");
  for (const name of ["내 최고 기록", "게임 순위", "참가자 분포", "오늘 참가자"]) {
    await expect(aside.getByRole("heading", { name })).toBeVisible();
  }
});

test("탭을 바꾸면 게임 판과 오른쪽 영역이 그 게임으로 바뀐다", async ({ page }) => {
  await skipUnlessSeveralGames(page);
  const aside = page.getByRole("complementary");
  const boardBefore = await gameBoard(page).innerText();
  const asideBefore = await aside.innerText();

  await gameTabs(page).nth(1).click();

  await expect(gameTabs(page).nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(gameTabs(page).first()).toHaveAttribute("aria-pressed", "false");
  await expect(gameBoard(page)).not.toHaveText(boardBefore);
  await expect(aside).not.toHaveText(asideBefore);
  await expect(aside.getByRole("heading", { name: "게임 순위" })).toBeVisible();
});

test("선택된 탭이 굵어져도 탭 폭은 그대로다", async ({ page }) => {
  await skipUnlessSeveralGames(page);
  const tab = gameTabs(page).nth(1);
  const before = await tab.boundingBox();
  await tab.click();
  const after = await tab.boundingBox();

  expect(after?.width).toBe(before?.width);
});

for (const width of [280, 375, 768, 1280]) {
  test(`${width}px 폭에서 가로 스크롤이 없다`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

    expect(scrollWidth).toBeLessThanOrEqual(width);
  });
}

test("최소 폭보다 좁으면 280px 폭으로 가로 스크롤한다", async ({ page }) => {
  await page.setViewportSize({ width: 240, height: 800 });
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);

  expect(scrollWidth).toBe(280);
});

test("데스크톱에서 스크롤하면 게임 영역은 고정되고 오른쪽만 올라간다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 600 });
  const section = gameSection(page);
  const aside = page.getByRole("complementary");
  const box = async (locator: typeof section) =>
    (await locator.boundingBox()) ?? { y: 0, height: 0 };
  const scrollTo = async (y: number) => {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(y);
  };

  // 옆 영역이 게임 영역보다 긴 만큼만 게임 영역이 고정된다. 실제 기록 양에 따라 길이가 달라서 재서 스크롤한다.
  const start = await box(section);
  const stickyRange = (await box(aside)).height - start.height;
  test.skip(stickyRange < 40, "옆 영역이 게임 영역보다 짧아 고정되는 구간이 없다.");
  const stuckAt = Math.ceil(start.y);

  await scrollTo(stuckAt);
  const stuck = (await box(section)).y;
  const asideBefore = (await box(aside)).y;

  await scrollTo(stuckAt + Math.floor(stickyRange / 2));
  expect((await box(aside)).y).toBeLessThan(asideBefore);
  expect((await box(section)).y).toBe(stuck);
});
