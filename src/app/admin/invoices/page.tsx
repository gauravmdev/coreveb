import {
  listCompanies,
  listInvoicesWithRefs,
  listProjectsWithCompany,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Submit, inputCls } from "@/components/app/form";
import {
  INVOICE_STATUS,
  INVOICE_STATUSES,
  formatCurrency,
  formatDate,
} from "@/lib/crm";
import { PageHeader } from "@/components/app/ui";
import { Drawer } from "@/components/app/drawer";
import { createInvoice, setInvoiceStatus } from "@/app/admin/actions";

export default async function AdminInvoices() {
  const rows = await listInvoicesWithRefs();
  const companies = await listCompanies();
  const projects = await listProjectsWithCompany();

  const outstanding = rows
    .filter((r) => r.invoice.status === "sent" || r.invoice.status === "overdue")
    .reduce((s, r) => s + r.invoice.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description={`${formatCurrency(outstanding)} outstanding.`}>
        <Drawer label="New invoice" title="New invoice" description="Bill a client for work.">
          <form action={createInvoice} className="space-y-4">
            <Field label="Client">
              <select name="companyId" required className={inputCls} defaultValue="">
                <option value="" disabled>
                  Select client…
                </option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Project (optional)">
              <select name="projectId" className={inputCls} defaultValue="">
                <option value="">— None —</option>
                {projects.map(({ project, companyName }) => (
                  <option key={project.id} value={project.id}>
                    {companyName} · {project.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Invoice number">
              <input name="number" required className={inputCls} placeholder="INV-1004" />
            </Field>
            <Field label="Amount (₹)">
              <input name="amount" type="number" min="0" className={inputCls} placeholder="50000" />
            </Field>
            <Field label="Due date">
              <input name="dueAt" type="date" className={inputCls} />
            </Field>
            <Field label="Status">
              <select name="status" className={inputCls} defaultValue="draft">
                {INVOICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {INVOICE_STATUS[s].label}
                  </option>
                ))}
              </select>
            </Field>
            <Submit>Create invoice</Submit>
          </form>
        </Drawer>
      </PageHeader>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface/40 shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-medium">Invoice</th>
              <th className="px-5 py-3.5 font-medium">Client</th>
              <th className="px-5 py-3.5 text-right font-medium">Amount</th>
              <th className="px-5 py-3.5 font-medium">Due</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ invoice: inv, companyName, projectName }) => (
              <tr
                key={inv.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-bg/40"
              >
                <td className="px-5 py-3.5">
                  <div className="font-mono text-muted">{inv.number}</div>
                  <div className="text-xs text-muted">{projectName ?? "—"}</div>
                </td>
                <td className="px-5 py-3.5">{companyName ?? "—"}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(inv.amount)}</td>
                <td className="px-5 py-3.5 text-muted">{formatDate(inv.dueAt)}</td>
                <td className="px-5 py-3.5">
                  <form action={setInvoiceStatus} className="flex items-center gap-2">
                    <input type="hidden" name="invoiceId" value={inv.id} />
                    <Badge tone={INVOICE_STATUS[inv.status].tone}>
                      {INVOICE_STATUS[inv.status].label}
                    </Badge>
                    <select name="status" defaultValue={inv.status} className={`${inputCls} w-auto py-1`}>
                      {INVOICE_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {INVOICE_STATUS[s].label}
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
                <td colSpan={5} className="px-5 py-10 text-center text-muted">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on mobile */}
      <div className="space-y-3 sm:hidden">
        {rows.map(({ invoice: inv, companyName, projectName }) => (
          <div key={inv.id} className="rounded-2xl border border-border bg-surface/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-muted">{inv.number}</span>
              <span className="font-semibold">{formatCurrency(inv.amount)}</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {companyName ?? "—"}
              {projectName ? ` · ${projectName}` : ""} · Due {formatDate(inv.dueAt)}
            </div>
            <form action={setInvoiceStatus} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="invoiceId" value={inv.id} />
              <Badge tone={INVOICE_STATUS[inv.status].tone}>
                {INVOICE_STATUS[inv.status].label}
              </Badge>
              <select name="status" defaultValue={inv.status} className={`${inputCls} w-auto flex-1 py-1`}>
                {INVOICE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {INVOICE_STATUS[s].label}
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
            No invoices yet.
          </p>
        )}
      </div>
    </div>
  );
}
