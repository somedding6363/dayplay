import type { ButtonHTMLAttributes } from "react";
import { cx } from "@/shared/lib";

type ButtonVariant = "primary" | "soft";
type ButtonSize = "sm" | "md";
type ButtonShape = "pill" | "rounded";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  shape?: ButtonShape;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-primary",
  soft: "bg-canvas-soft text-ink",
};

const shapeClass: Record<ButtonShape, string> = {
  pill: "rounded-full",
  rounded: "rounded-xs",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 px-4",
  md: "h-11 px-4",
};

export function Button({
  variant = "primary",
  size = "md",
  shape = "pill",
  type = "button",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-button-utility",
        shapeClass[shape],
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
}
