import Link from "next/link";
import { ensureNickname } from "@/entities/user/server";
import { AccountMenu, SignInButton } from "@/features/auth";
import { auth } from "@/features/auth/server";
import { PageContainer } from "@/shared/ui/page-container";

export async function SiteHeader() {
  const session = await auth();
  const nickname = session ? await ensureNickname(session.user.id) : null;

  return (
    <header className="py-5">
      <PageContainer className="flex items-center justify-between">
        <Link href="/" className="text-tagline">
          dayplay
        </Link>
        <nav aria-label="주요 메뉴">
          {session && nickname ? (
            <AccountMenu name={nickname} email={session.user.email} image={session.user.image} />
          ) : (
            <SignInButton />
          )}
        </nav>
      </PageContainer>
    </header>
  );
}
