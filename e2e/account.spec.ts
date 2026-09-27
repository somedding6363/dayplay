import { expect, test } from "@playwright/test";

test("로그인하지 않고 계정 설정에 들어가면 로그인을 안내한다", async ({ page }) => {
  await page.goto("/account");

  await expect(page.getByRole("heading", { level: 1, name: "로그인이 필요해요" })).toBeVisible();
  await expect(page.getByRole("main").getByRole("button", { name: "로그인" })).toBeVisible();
});
