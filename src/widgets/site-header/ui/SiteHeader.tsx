import Link from "next/link";
import { AccountMenu, SignInButton } from "@/features/auth";
import { auth } from "@/features/auth/server";
import { PageContainer } from "@/shared/ui/page-container";

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="py-5">
      <PageContainer className="flex items-center justify-between">
        <Link href="/" className="text-tagline">
          dayplay
        </Link>
        <nav aria-label="주요 메뉴">
          {session ? (
            <AccountMenu
              name={session.user.name ?? session.user.email ?? "사용자"}
              email={session.user.email}
              image={session.user.image}
            />
          ) : (
            <SignInButton />
          )}
        </nav>
      </PageContainer>
    </header>
  );
}
