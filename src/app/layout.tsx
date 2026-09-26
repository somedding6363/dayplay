import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dayplay",
  description: "매일 한 개 이상의 게임이 열리는 게임 플랫폼",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
