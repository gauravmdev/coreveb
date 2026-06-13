import Link from "next/link";
import { getAdminOverview, listRecentNotes } from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/crm";

export default async function AdminOverview() {
  const o = getAdminOverview();
  const recent = listRecentNotes(8);

  const stats = [
    { label: "Clients", value: String(o.companies), href: "/admin/clients" },
    { label: "Projects", value: String(o.projects), href: "/admin/projects" },
    { label: "Deals", value: String(o.deals), href: "/admin/deals" },
    {
      label: o.pendingQuotes > 0 ? `Quotes (${o.pendingQuotes} pending)` : "Quotes",
      value: String(o.quotations),
      href: "/admin/quotations",
    },
    { label: "Invoices", value: String(o.invoices), href: "/admin/invoices" },
    { label: "Outstanding", value: formatCurrency(o.outstanding), href: "/admin/invoices" },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-muted">Your agency at a glance.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-border bg-surface/40 px-5 py-5 transition-colors hover:border-brand/40"
          >
            <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
            <div className="mt-1 text-xs text-muted">{s.label}</div>
          </Link>
        ))}
      </div>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
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
