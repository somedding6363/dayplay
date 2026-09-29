import { expect, test, type Page } from "@playwright/test";

// 2026-09-26(DAYPLAY_TODAY)은 토요일이라 무한 계단 오르기만 열린다. 결과 숫자는 검사하지 않고 흐름만 본다.
const section = (page: Page) => page.getByRole("region", { name: "오늘의 게임" });
const startButton = (page: Page) =>
  section(page).getByRole("button", { name: "시작", exact: true });
const climbButton = (page: Page) =>
  section(page).getByRole("button", { name: "오르기", exact: true });
const turnButton = (page: Page) =>
  section(page).getByRole("button", { name: "방향 전환", exact: true });
const restartButton = (page: Page) => section(page).getByRole("button", { name: "다시 하기" });
const resultPanel = (page: Page) => section(page).locator('[aria-live="polite"]');
const gauge = (page: Page) => section(page).getByRole("progressbar", { name: "남은 시간" });

// 다음 계단이 지금 계단보다 오른쪽이면 1, 왼쪽이면 -1. 화면에 그려진 계단 위치로 찾는다.
async function nextDirection(page: Page) {
  return section(page).evaluate((root) => {
    const stairs = [...root.querySelectorAll<HTMLElement>("span.absolute.h-2\\.5")];
    const current = stairs.find((stair) => stair.classList.contains("bg-game-ink"));
    if (!current) return 0;
    const bottom = parseFloat(current.style.bottom);
    const next = stairs.find((stair) => parseFloat(stair.style.bottom) > bottom);
    if (!next) return 0;
    return next.getBoundingClientRect().left > current.getBoundingClientRect().left ? 1 : -1;
  });
}

// 결과 검증은 한 칸을 60ms보다 빨리 오른 결과를 거부한다. 자동화 입력은 그보다 빨라서 사람처럼 쉰다.
const humanDelay = (page: Page) => page.waitForTimeout(120);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("계단 방향이 같으면 오르기, 꺾이면 방향 전환을 눌러 오르고, 틀리면 끝난다", async ({
  page,
}) => {
  await startButton(page).click();
  await expect(gauge(page)).toBeVisible();
  await expect(turnButton(page)).toHaveAttribute("aria-keyshortcuts", "Space");
  await expect(climbButton(page)).toHaveAttribute("aria-keyshortcuts", "ArrowUp");

  // 캐릭터는 오른쪽을 보고 시작한다.
  let facing = 1;
  for (let step = 1; step <= 5; step += 1) {
    const direction = await nextDirection(page);
    expect(direction).not.toBe(0);
    await humanDelay(page);
    await (direction === facing ? climbButton(page) : turnButton(page)).click();
    facing = direction;
    await expect(section(page)).toContainText(`${step}계단`);
  }

  const direction = await nextDirection(page);
  await (direction === facing ? turnButton(page) : climbButton(page)).click();
  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText("5계단");
});

test("스페이스바로 방향 전환, ↑로 오르기를 한다", async ({ page }) => {
  await startButton(page).click();
  let facing = 1;
  for (let step = 1; step <= 3; step += 1) {
    const direction = await nextDirection(page);
    await humanDelay(page);
    await page.keyboard.press(direction === facing ? "ArrowUp" : "Space");
    facing = direction;
    await expect(section(page)).toContainText(`${step}계단`);
  }
});

test("조작 버튼을 누른 뒤 스페이스바를 눌러도 한 번만 움직인다", async ({ page }) => {
  await startButton(page).click();

  // 계단이 꺾이기 직전까지 버튼으로 오른다. 마지막으로 누른 버튼에 focus가 남는다.
  let facing = 1;
  let steps = 0;
  while ((await nextDirection(page)) === facing) {
    await humanDelay(page);
    await climbButton(page).click();
    steps += 1;
    await expect(section(page)).toContainText(`${steps}계단`);
  }
  if (steps === 0) {
    await humanDelay(page);
    await turnButton(page).click();
    facing = -facing;
    steps += 1;
    await expect(section(page)).toContainText(`${steps}계단`);
    while ((await nextDirection(page)) === facing) {
      await humanDelay(page);
      await climbButton(page).click();
      steps += 1;
      await expect(section(page)).toContainText(`${steps}계단`);
    }
  }

  // 스페이스바는 방향 전환 한 번으로만 처리한다. focus된 버튼의 click이 더해지면 틀려서 끝난다.
  await humanDelay(page);
  await page.keyboard.press("Space");
  await expect(section(page)).toContainText(`${steps + 1}계단`);
  await expect(gauge(page)).toBeVisible();
});

test("시간 게이지가 다 떨어지면 끝난다", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await startButton(page).click();
  await expect(gauge(page)).toBeVisible();

  await page.clock.runFor(4000);

  await expect(restartButton(page)).toBeVisible();
  await expect(resultPanel(page)).toContainText("0계단");
});
