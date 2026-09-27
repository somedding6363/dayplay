import type { Metadata } from "next";
import { ensureNickname } from "@/entities/user/server";
import { auth } from "@/features/auth/server";
import { PageContainer } from "@/shared/ui/page-container";
import { SettingRow } from "./SettingRow";
import { SignedOutNotice } from "./SignedOutNotice";

export const metadata: Metadata = { title: "계정 설정 · dayplay" };

export default async function AccountPage() {
  const session = await auth();
  const nickname = session ? await ensureNickname(session.user.id) : null;

  return (
    <PageContainer className="flex flex-1 flex-col pt-6 pb-16">
      <main className="flex flex-1 flex-col">
        {session && nickname ? (
          <div className="flex max-w-xl flex-col gap-8">
            <h1 className="text-tagline">계정 설정</h1>
            <section aria-labelledby="account-profile" className="flex flex-col gap-2">
              <h2 id="account-profile" className="text-caption-strong text-muted">
                계정
              </h2>
              <dl className="border-t border-hairline">
                <SettingRow label="닉네임" value={nickname} />
                <SettingRow label="이메일" value={session.user.email ?? "-"} />
                <SettingRow label="로그인" value="Google" />
              </dl>
            </section>
          </div>
        ) : (
          <SignedOutNotice />
        )}
      </main>
    </PageContainer>
  );
}
