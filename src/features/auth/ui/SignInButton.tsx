import { Button } from "@/shared/ui/button";
import { signInWithGoogle } from "../api/actions";

interface SignInButtonProps {
  label?: string;
  size?: "sm" | "md";
}

export function SignInButton({ label = "로그인", size = "md" }: SignInButtonProps) {
  return (
    <form action={signInWithGoogle}>
      <Button type="submit" shape="rounded" size={size}>
        {label}
      </Button>
    </form>
  );
}
