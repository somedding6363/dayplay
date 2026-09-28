import type { ComponentProps } from "react";
import { cx } from "@/shared/lib";

// 키보드 단축키를 보여주는 키캡. 키보드가 없을 가능성이 큰 터치 기기(pointer: coarse)에서는 숨긴다.
// 버튼 안에 쓸 때는 버튼 이름에 섞이지 않도록 읽지 않게 하고, 버튼에 aria-keyshortcuts를 준다.
export function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      aria-hidden="true"
      className={cx(
        "hidden h-6 min-w-6 items-center justify-center rounded-2xs border border-current px-1.5 font-sans text-caption leading-none opacity-60 pointer-fine:inline-flex",
        className,
      )}
      {...props}
    />
  );
}
