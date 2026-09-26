import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { PageContainer } from "@/shared/ui/page-container";

export function SiteHeader() {
  return (
    <header className="py-5">
      <PageContainer className="flex items-center justify-between">
        <Link href="/" className="text-tagline">
          dayplay
        </Link>
        <nav aria-label="주요 메뉴">
          <Button shape="rounded">로그인</Button>
        </nav>
      </PageContainer>
    </header>
  );
}
