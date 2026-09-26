import type { HTMLAttributes } from "react";
import { cx } from "@/shared/lib";

export function PageContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("mx-auto w-full max-w-5xl px-4 sm:px-8", className)} {...props} />;
}
