import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "dayplay",
  description: "매일 하나씩 열리는 미니게임",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
