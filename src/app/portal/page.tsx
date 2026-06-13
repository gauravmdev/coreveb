import Link from "next/link";
import { requireUser } from "@/lib/session";
import {
  getCompany,
  getCompanyInvoices,
  getCompanyProjects,
  getClientNotes,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { StageTimeline } from "@/components/app/stage-timeline";
import {
  PROJECT_STATUS,
  PROJECT_TYPE_LABEL,
  formatCurrency,
  formatDate,
  projectProgress,
  type ProjectType,
} from "@/lib/crm";

export default async function PortalHome() {
  const user = await requireUser();

  if (!user.companyId) {
    return <EmptyState name={user.name ?? user.email ?? "there"} />;
  }

  const company = getCompany(user.companyId);
  const projects = getCompanyProjects(user.companyId);
  const invoices = getCompanyInvoices(user.companyId);
  const updates = getClientNotes(user.companyId);

  const outstanding = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm text-muted">Welcome back{user.name ? `, ${user.name}` : ""}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          {company?.name ?? "Your projects"}
        </h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Active projects" value={String(projects.filter((p) => p.status === "active").length)} />
        <Stat label="Outstanding" value={formatCurrency(outstanding)} />
        <Stat label="Updates" value={String(updates.length)} />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Projects</h2>
        {projects.length === 0 ? (
          <p className="rounded-2xl border border-border bg-surface/40 p-6 text-sm text-muted">
            No projects yet. Your Coreveb team will set these up once your
            engagement kicks off.
          </p>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => {
              const status = PROJECT_STATUS[project.status];
              const { currentStage } = projectProgress(project);
              return (
                <Link
                  key={project.id}
                  href={`/portal/projects/${project.id}`}
                  className="block rounded-2xl border border-border bg-surface/40 p-6 transition-all hover:-translate-y-0.5 hover:border-brand/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{project.name}</h3>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {PROJECT_TYPE_LABEL[project.type as ProjectType]} ·
                        Currently in <span className="text-brand-soft">{currentStage}</span>
                        {project.targetDate
                          ? ` · Target ${formatDate(project.targetDate)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5">
                    <StageTimeline project={project} />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent invoices</h2>
            <Link href="/portal/invoices" className="text-sm text-brand-soft hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border">
            {invoices.slice(0, 4).map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between border-b border-border/60 px-5 py-3 text-sm last:border-0"
              >
                <span className="font-mono text-muted">{inv.number}</span>
                <span>{formatCurrency(inv.amount)}</span>
                <Badge tone={INVOICE_TONE(inv.status)}>{inv.status}</Badge>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="px-5 py-4 text-sm text-muted">No invoices yet.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold">Latest updates</h2>
          <div className="space-y-3">
            {updates.slice(0, 5).map((note) => (
              <div key={note.id} className="rounded-xl border border-border bg-surface/40 p-4">
                <p className="text-sm">{note.body}</p>
                <p className="mt-2 text-xs text-muted">
                  {note.authorName ?? "Coreveb"} · {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
            {updates.length === 0 && (
              <p className="rounded-xl border border-border bg-surface/40 p-4 text-sm text-muted">
                No updates yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function INVOICE_TONE(status: string) {
  return status === "paid"
    ? ("green" as const)
    : status === "overdue"
      ? ("red" as const)
      : status === "sent"
        ? ("brand" as const)
        : ("muted" as const);
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/40 px-6 py-5">
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm text-muted">{label}</div>
    </div>
  );
}

function EmptyState({ name }: { name: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface/40 p-10 text-center">
      <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
      <p className="mt-3 text-muted">
        Your account isn&apos;t linked to a company workspace yet. Your Coreveb
        contact will connect you to your projects shortly.
      </p>
      <p className="mt-4 text-sm text-muted">
        Need help? <a className="text-brand-soft" href="mailto:hello@coreveb.com">hello@coreveb.com</a>
      </p>
    </div>
  );
}
