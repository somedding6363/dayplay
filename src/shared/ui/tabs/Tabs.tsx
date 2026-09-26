import type { ReactNode } from "react";

interface TabsProps {
  label: string;
  children: ReactNode;
}

export function Tabs({ label, children }: TabsProps) {
  return (
    <ul
      aria-label={label}
      className="scrollbar-none flex gap-7 overflow-x-auto border-b border-hairline mask-r-from-85%"
    >
      {children}
    </ul>
  );
}
