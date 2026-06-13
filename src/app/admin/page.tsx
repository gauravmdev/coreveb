import { requireAdmin } from "@/lib/session";
import { getAdminOverview, getUnreadTotal, listRecentNotes } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/crm";
import {
  AttentionCard,
  MetricCard,
  PageHeader,
  SectionTitle,
} from "@/components/app/ui";

export default async function AdminOverview() {
  const user = await requireAdmin();
  const o = await getAdminOverview();
  const unread = await getUnreadTotal(user);
  const recent = await listRecentNotes(6);

  const attention = [
    {
      icon: "chat" as const,
      label: "unread messages",
      count: unread,
      href: "/admin/messages",
      detail: "Replies waiting from clients",
    },
    {
      icon: "doc" as const,
      label: "quotes awaiting client",
      count: o.pendingQuotes,
      href: "/admin/quotations",
      detail: "Sent, not yet accepted",
    },
    {
      icon: "shield" as const,
      label: "stage sign-offs pending",
      count: o.awaitingApprovals,
      href: "/admin/projects",
      detail: "Awaiting client approval",
    },
    {
      icon: "receipt" as const,
      label: "overdue invoices",
      count: o.overdueCount,
      href: "/admin/invoices",
      detail: o.overdueCount
        ? `${formatCurrency(o.overdueAmount)} past due`
        : "All clear",
    },
  ];

  return (
    <div className="space-y-10">
      <PageHeader title="Overview" description="Your agency at a glance." />

      <section>
        <SectionTitle>Needs attention</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {attention.map((a) => (
            <AttentionCard key={a.label} {...a} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Pipeline &amp; billing</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon="users" label="Clients" value={String(o.companies)} href="/admin/clients" />
          <MetricCard
            icon="folder"
            label="Active projects"
            value={String(o.activeProjects)}
            sub={`${o.projects} total`}
            href="/admin/projects"
          />
          <MetricCard
            icon="target"
            label="Won pipeline"
            value={formatCurrency(o.wonValue)}
            sub={`${o.deals} deals`}
            href="/admin/deals"
          />
          <MetricCard
            icon="receipt"
            label="Outstanding"
            value={formatCurrency(o.outstanding)}
            sub={`${o.invoices} invoices`}
            href="/admin/invoices"
          />
        </div>
      </section>

      <section>
        <SectionTitle>Recent activity</SectionTitle>
        <div className="space-y-3">
          {recent.map(({ note, companyName }) => (
            <div
              key={note.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-border bg-surface/40 p-4"
            >
              <div>
                <p className="text-sm">{note.body}</p>
                <p className="mt-1 text-xs text-muted">
                  {companyName ?? "—"} · {note.authorName ?? "Coreveb"}
                  {note.visibleToClient ? " · shared with client" : " · internal"}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted">
                {formatDate(note.createdAt)}
              </span>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="rounded-xl border border-border bg-surface/40 p-4 text-sm text-muted">
              No activity yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
