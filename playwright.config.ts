import { defineConfig, devices } from "@playwright/test";

// 하루에 cycle game이 하나라 게임마다 그 게임이 열리는 날짜로 고정한 서버를 따로 띄운다.
// 빌드는 test:e2e 스크립트가 한 번만 하고, 서버는 같은 빌드를 날짜만 바꿔 띄운다.
const servers = [
  {
    name: "reaction-time",
    port: 3100,
    date: "2026-09-21",
    testMatch: /(home|account|reaction-time)\.spec\.ts/,
  },
  { name: "ten-seconds", port: 3101, date: "2026-09-22", testMatch: /ten-seconds\.spec\.ts/ },
  { name: "odd-color", port: 3102, date: "2026-09-23", testMatch: /odd-color\.spec\.ts/ },
  { name: "stair-climb", port: 3103, date: "2026-09-24", testMatch: /stair-climb\.spec\.ts/ },
  { name: "coin-flip", port: 3104, date: "2026-09-25", testMatch: /coin-flip\.spec\.ts/ },
  { name: "racing", port: 3105, date: "2026-09-26", testMatch: /racing\.spec\.ts/ },
  { name: "poop-dodge", port: 3106, date: "2026-09-27", testMatch: /poop-dodge\.spec\.ts/ },
];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: { trace: "on-first-retry" },
  projects: servers.map(({ name, port, testMatch }) => ({
    name,
    testMatch,
    use: { ...devices["Desktop Chrome"], baseURL: `http://localhost:${port}` },
  })),
  // 개발 서버 대신 프로덕션 빌드로 띄워 실제 배포와 같은 결과를 본다.
  webServer: servers.map(({ port, date }) => ({
    command: `npx next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    // next start는 Vercel과 달리 요청 host를 자동으로 믿지 않아서 Auth.js 세션 확인이 실패한다.
    env: { DAYPLAY_TODAY: date, AUTH_TRUST_HOST: "true" },
    timeout: 60_000,
  })),
});
