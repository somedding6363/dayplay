import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // 개발 서버 대신 프로덕션 빌드로 띄워 실제 배포와 같은 결과를 본다.
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    // 탭 전환을 검사하려면 게임이 두 개 이상 열리는 날이어야 해서 날짜를 고정한다.
    env: { DAYPLAY_TODAY: "2026-09-28" },
    timeout: 180_000,
  },
});
