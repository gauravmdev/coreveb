import { listContactSubmissions } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { inputCls } from "@/components/app/form";
import { formatDate } from "@/lib/crm";
import { PageHeader } from "@/components/app/ui";
import { setLeadStatus } from "@/app/admin/actions";

const STATUS_TONE = {
  new: "brand",
  read: "muted",
  archived: "muted",
} as const;

const STATUSES = ["new", "read", "archived"] as const;

export default async function AdminLeads() {
  const rows = await listContactSubmissions();
  const newCount = rows.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description={
          rows.length === 0
            ? "Enquiries from the website contact form land here."
            : `${newCount} new of ${rows.length} total.`
        }
      />

      {/* Table on sm+ */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface/40 shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-medium">Contact</th>
              <th className="px-5 py-3.5 font-medium">Enquiry</th>
              <th className="px-5 py-3.5 font-medium">Received</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border/60 align-top transition-colors last:border-0 hover:bg-bg/40"
              >
                <td className="px-5 py-3.5">
                  <div className="font-medium">{r.name}</div>
                  <a href={`mailto:${r.email}`} className="text-xs text-muted hover:text-brand-soft">
                    {r.email}
                  </a>
                  {r.company && <div className="text-xs text-muted">{r.company}</div>}
                </td>
                <td className="max-w-md px-5 py-3.5">
                  {(r.service || r.budget) && (
                    <div className="mb-1 flex flex-wrap gap-1.5 text-xs text-muted">
                      {r.service && <span className="rounded bg-bg px-1.5 py-0.5">{r.service}</span>}
                      {r.budget && <span className="rounded bg-bg px-1.5 py-0.5">{r.budget}</span>}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap text-fg/90">{r.message}</p>
                </td>
                <td className="px-5 py-3.5 text-muted">{formatDate(r.createdAt)}</td>
                <td className="px-5 py-3.5">
                  <form action={setLeadStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
                    <select name="status" defaultValue={r.status} className={`${inputCls} w-auto py-1`}>
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-2.5 py-1 text-xs hover:border-brand/50"
                    >
                      Set
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  No enquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on mobile */}
      <div className="space-y-3 sm:hidden">
        {rows.map((r) => (
          <div key={r.id} className="rounded-2xl border border-border bg-surface/40 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{r.name}</span>
              <Badge tone={STATUS_TONE[r.status]}>{r.status}</Badge>
            </div>
            <a href={`mailto:${r.email}`} className="text-xs text-muted hover:text-brand-soft">
              {r.email}
            </a>
            {(r.company || r.service || r.budget) && (
              <div className="mt-1 text-xs text-muted">
                {[r.company, r.service, r.budget].filter(Boolean).join(" · ")}
              </div>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-fg/90">{r.message}</p>
            <div className="mt-2 text-xs text-muted">{formatDate(r.createdAt)}</div>
            <form action={setLeadStatus} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="id" value={r.id} />
              <select name="status" defaultValue={r.status} className={`${inputCls} w-auto flex-1 py-1`}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1 text-xs hover:border-brand/50"
              >
                Set
              </button>
            </form>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted">
            No enquiries yet.
          </p>
        )}
      </div>
    </div>
  );
}
