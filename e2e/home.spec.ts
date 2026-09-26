import { expect, test, type Page } from "@playwright/test";

const gameSection = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const gameTab = (page: Page, name: string) =>
  page.getByRole("list", { name: "오늘의 게임 목록" }).getByRole("button", { name });

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("첫 화면에 날짜, 게임 탭, 게임 판을 보여준다", async ({ page }) => {
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/\d+월 \d+일 .요일/);
  await expect(page.getByText("게임은 매일 바뀌어요.")).toBeVisible();
  await expect(gameTab(page, "반응속도")).toHaveAttribute("aria-pressed", "true");
  await expect(gameSection(page).getByRole("button", { name: /시작/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "로그인" })).toBeVisible();
  await expect(page.getByRole("contentinfo")).toContainText("duworks");
});

test("탭을 바꾸면 게임 판과 오른쪽 영역이 그 게임으로 바뀐다", async ({ page }) => {
  const aside = page.getByRole("complementary");
  const before = await aside.innerText();

  await gameTab(page, "10초 맞추기").click();

  await expect(gameTab(page, "10초 맞추기")).toHaveAttribute("aria-pressed", "true");
  await expect(gameTab(page, "반응속도")).toHaveAttribute("aria-pressed", "false");
  await expect(gameSection(page)).toContainText("정확히 10초에 멈추세요.");
  await expect(aside).not.toHaveText(before);
  await expect(aside.getByRole("heading", { name: "게임 순위" })).toBeVisible();
});

test("선택된 탭이 굵어져도 탭 폭은 그대로다", async ({ page }) => {
  const tab = gameTab(page, "10초 맞추기");
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
  const sectionTop = async () => (await section.boundingBox())?.y ?? 0;
  const asideTop = async () => (await aside.boundingBox())?.y ?? 0;

  await page.mouse.wheel(0, 200);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const stuck = await sectionTop();
  const asideBefore = await asideTop();

  await page.mouse.wheel(0, 100);
  await expect.poll(asideTop).toBeLessThan(asideBefore);
  expect(await sectionTop()).toBe(stuck);
});
