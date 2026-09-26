import { Button } from "@/shared/ui/button";
import { signInWithGoogle } from "../api/actions";

export function SignInButton() {
  return (
    <form action={signInWithGoogle}>
      <Button type="submit" shape="rounded">
        로그인
      </Button>
    </form>
  );
}
