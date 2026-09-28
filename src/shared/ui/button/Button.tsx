import type { ComponentProps } from "react";
import { cx } from "@/shared/lib";

type ButtonVariant = "primary" | "soft" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";
type ButtonAlign = "center" | "start";
type ButtonShape = "pill" | "rounded";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
  // start는 메뉴 항목처럼 폭을 채우고 글자를 왼쪽에 둔다.
  align?: ButtonAlign;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-primary",
  soft: "bg-canvas-soft text-ink",
  ghost: "text-ink hover:bg-canvas-soft",
};

const shapeClass: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-xs",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-4",
  // 게임 조작처럼 빠르게 연달아 누르는 큰 터치 영역
  lg: "h-14 px-6",
  icon: "size-10",
};

const alignClass: Record<ButtonAlign, string> = {
  center: "justify-center",
  start: "w-full justify-start",
};

export function Button({
  variant = "primary",
  size = "md",
  shape = "pill",
  align = "center",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-button-utility",
        shapeClass[shape],
        alignClass[align],
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
