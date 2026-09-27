import { SignInButton } from "@/features/auth";
import { UserIcon } from "@/shared/ui/icons";

export function SignedOutNotice() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center break-keep">
      <span className="flex size-12 items-center justify-center rounded-full bg-canvas-soft">
        <UserIcon size={22} />
      </span>
      <h1 className="text-tagline">로그인이 필요해요</h1>
      <p className="text-body text-muted">계정 설정은 로그인한 뒤에 볼 수 있어요.</p>
      <div className="mt-2">
        <SignInButton label="Google로 로그인" />
      </div>
    </div>
  );
}
