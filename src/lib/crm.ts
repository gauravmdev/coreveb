import type { Project } from "@/db/schema";

export type ProjectType = "software" | "web" | "mobile" | "marketing";

/** Stage pipeline per project type — clients see progress along these. */
export const PIPELINES: Record<ProjectType, string[]> = {
  software: ["Discovery", "Design", "Build", "QA", "Launch", "Growth"],
  web: ["Discovery", "Design", "Build", "QA", "Launch", "Growth"],
  mobile: ["Discovery", "Design", "Build", "Beta", "Store Launch", "Growth"],
  marketing: ["Audit", "Strategy", "Setup", "Launch", "Optimize", "Report"],
};

export const PROJECT_TYPE_LABEL: Record<ProjectType, string> = {
  software: "Software",
  web: "Web App",
  mobile: "Mobile App",
  marketing: "Marketing",
};

export function stagesFor(type: ProjectType) {
  return PIPELINES[type] ?? PIPELINES.software;
}

export function projectProgress(project: Pick<Project, "type" | "stageIndex" | "status">) {
  const stages = stagesFor(project.type as ProjectType);
  const lastIndex = stages.length - 1;
  const clamped = Math.max(0, Math.min(project.stageIndex, lastIndex));
  const isDone = project.status === "completed";
  const pct = isDone ? 100 : Math.round((clamped / lastIndex) * 100);
  return {
    stages,
    currentIndex: clamped,
    currentStage: stages[clamped],
    pct,
    isDone,
  };
}

/* ------------------------------- Label maps ------------------------------- */

export const PROJECT_STATUS: Record<
  Project["status"],
  { label: string; tone: Tone }
> = {
  active: { label: "Active", tone: "brand" },
  on_hold: { label: "On hold", tone: "amber" },
  completed: { label: "Completed", tone: "green" },
  cancelled: { label: "Cancelled", tone: "red" },
};

export const DEAL_STAGES = [
  "lead",
  "qualified",
  "proposal",
  "won",
  "lost",
] as const;

export const DEAL_STAGE: Record<(typeof DEAL_STAGES)[number], { label: string; tone: Tone }> = {
  lead: { label: "Lead", tone: "muted" },
  qualified: { label: "Qualified", tone: "brand" },
  proposal: { label: "Proposal", tone: "amber" },
  won: { label: "Won", tone: "green" },
  lost: { label: "Lost", tone: "red" },
};

export const INVOICE_STATUSES = ["draft", "sent", "paid", "overdue"] as const;

export const INVOICE_STATUS: Record<(typeof INVOICE_STATUSES)[number], { label: string; tone: Tone }> = {
  draft: { label: "Draft", tone: "muted" },
  sent: { label: "Sent", tone: "brand" },
  paid: { label: "Paid", tone: "green" },
  overdue: { label: "Overdue", tone: "red" },
};

export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "declined",
  "expired",
] as const;

export const QUOTE_STATUS: Record<
  (typeof QUOTE_STATUSES)[number],
  { label: string; tone: Tone }
> = {
  draft: { label: "Draft", tone: "muted" },
  sent: { label: "Sent", tone: "brand" },
  accepted: { label: "Accepted", tone: "green" },
  declined: { label: "Declined", tone: "red" },
  expired: { label: "Expired", tone: "amber" },
};

export const MILESTONE_STATUS: Record<
  "pending" | "invoiced" | "paid",
  { label: string; tone: Tone }
> = {
  pending: { label: "Scheduled", tone: "muted" },
  invoiced: { label: "Invoiced", tone: "brand" },
  paid: { label: "Paid", tone: "green" },
};

export function quoteTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate = 0,
) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (taxRate / 100);
  return { subtotal, tax, total: subtotal + tax };
}

export type Tone = "brand" | "green" | "amber" | "red" | "muted";

export const TONE_CLASS: Record<Tone, string> = {
  brand: "bg-brand/15 text-brand-soft border-brand/30",
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  muted: "bg-surface text-muted border-border",
};

/* ------------------------------- Formatting ------------------------------- */

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(d: Date | number | null | undefined) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d));
}
