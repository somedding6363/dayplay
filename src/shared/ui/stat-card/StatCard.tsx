import { useId, type ReactNode } from "react";

interface StatCardProps {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
}

export function StatCard({ title, meta, children }: StatCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className="flex flex-col gap-4 rounded-md bg-canvas-soft/50 p-6"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h2 id={titleId} className="text-body-strong">
          {title}
        </h2>
        {meta ? (
          <span className="text-fine-print tracking-wide text-muted uppercase">{meta}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
