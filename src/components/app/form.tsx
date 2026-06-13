import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-brand/60";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function Submit({ children = "Save" }: { children?: ReactNode }) {
  return (
    <button
      type="submit"
      className="sheen rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-soft"
    >
      {children}
    </button>
  );
}

export function Panel({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}
