"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { Avatar } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { signOutUser } from "../api/actions";

interface AccountMenuProps {
  name: string;
  email?: string | null;
  image?: string | null;
}

export function AccountMenu({ name, email, image }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) {
      return;
    }
    const closeOnOutside = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label="계정 메뉴"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar name={name} image={image} />
      </Button>

      {open ? (
        <div
          id={panelId}
          className="absolute top-full right-0 z-20 mt-2 flex w-60 flex-col rounded-sm bg-canvas p-2 shadow-popover"
        >
          <div className="flex flex-col gap-0.5 px-3 pt-2 pb-3">
            <span className="text-caption-strong">{name}</span>
            {email ? <span className="truncate text-fine-print text-muted">{email}</span> : null}
          </div>
          <div className="mx-1 mb-1 border-t border-hairline-soft" />
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="flex h-11 items-center rounded-xs px-3 text-button-utility hover:bg-canvas-soft"
          >
            계정 설정
          </Link>
          <form action={signOutUser}>
            <Button type="submit" variant="ghost" shape="rounded" align="start" className="px-3">
              로그아웃
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
