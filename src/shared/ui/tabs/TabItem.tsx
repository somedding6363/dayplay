import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/shared/lib";

interface TabItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  children: string;
  accentClassName?: string;
}

export function TabItem({
  selected,
  children,
  accentClassName = "bg-ink",
  className,
  ...props
}: TabItemProps) {
  return (
    <li className="flex shrink-0">
      <button
        type="button"
        aria-pressed={selected}
        className={cx(
          "relative grid py-3 text-body whitespace-nowrap transition-colors",
          selected ? "text-ink" : "text-muted hover:text-ink",
          className,
        )}
        {...props}
      >
        {/* 선택될 때 굵어져도 폭이 변하지 않도록 굵은 글자 폭을 미리 잡는다. */}
        <span aria-hidden="true" className="invisible col-start-1 row-start-1 font-semibold">
          {children}
        </span>
        <span className={cx("col-start-1 row-start-1 text-center", selected && "font-semibold")}>
          {children}
        </span>
        {selected ? (
          <span
            aria-hidden="true"
            className={cx("absolute inset-x-0 bottom-0 h-0.5 rounded-full", accentClassName)}
          />
        ) : null}
      </button>
    </li>
  );
}
