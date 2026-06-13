import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted">
      {children}
    </h2>
  );
}

export function MetricCard({
  icon,
  label,
  value,
  sub,
  href,
}: {
  icon: IconName;
  label: string;
  value: string;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <>
      <span className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-bg text-brand-soft">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-0.5 text-sm text-muted">{label}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </>
  );
  const cls =
    "block rounded-2xl border border-border bg-surface/70 p-5 shadow-sm transition-all";
  return href ? (
    <Link href={href} className={`${cls} hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md`}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

/** Actionable card for the dashboard — highlights when count > 0. */
export function AttentionCard({
  icon,
  label,
  count,
  detail,
  href,
}: {
  icon: IconName;
  label: string;
  count: number;
  detail?: string;
  href: string;
}) {
  const active = count > 0;
  return (
    <Link
      href={href}
      className={`flex items-center gap-4 rounded-2xl border p-5 shadow-sm transition-all ${
        active
          ? "border-brand/40 bg-brand/[0.07] hover:-translate-y-0.5 hover:shadow-md"
          : "border-border bg-surface/70 hover:border-brand/30"
      }`}
    >
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
          active ? "bg-brand/15 text-brand-soft" : "bg-surface text-muted"
        }`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">{count}</span>
          <span className="truncate text-sm font-medium">{label}</span>
        </div>
        {detail && <div className="mt-0.5 truncate text-xs text-muted">{detail}</div>}
      </div>
      <span className={`ml-auto shrink-0 text-sm ${active ? "text-brand-soft" : "text-muted"}`}>
        →
      </span>
    </Link>
  );
}
