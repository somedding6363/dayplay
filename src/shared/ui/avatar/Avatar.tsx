"use client";

import Image from "next/image";
import { useState } from "react";
import { cx } from "@/shared/lib";

interface AvatarProps {
  name: string;
  image?: string | null;
  className?: string;
}

// 사진이 없거나 불러오지 못하면 이름 첫 글자를 보여준다.
export function Avatar({ name, image, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = Array.from(name.trim())[0]?.toUpperCase() ?? "?";

  return (
    <span
      className={cx(
        "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-soft text-caption-strong text-on-primary",
        className,
      )}
    >
      {image && !failed ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="36px"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
}
