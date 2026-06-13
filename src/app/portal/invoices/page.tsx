import { requireUser } from "@/lib/session";
import { getCompanyInvoices } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { INVOICE_STATUS, formatCurrency, formatDate } from "@/lib/crm";

export default async function PortalInvoices() {
  const user = await requireUser();
  const invoices = user.companyId ? await getCompanyInvoices(user.companyId) : [];

  const paid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0);
  const due = invoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Invoices</h1>
        <p className="mt-1 text-muted">
          {formatCurrency(due)} outstanding · {formatCurrency(paid)} paid to date
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/40 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3 font-medium">Invoice</th>
              <th className="px-5 py-3 font-medium">Issued</th>
              <th className="px-5 py-3 font-medium">Due</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-3 font-mono text-muted">{inv.number}</td>
                <td className="px-5 py-3">{formatDate(inv.issuedAt)}</td>
                <td className="px-5 py-3">{formatDate(inv.dueAt)}</td>
                <td className="px-5 py-3 text-right">{formatCurrency(inv.amount)}</td>
                <td className="px-5 py-3 text-right">
                  <Badge tone={INVOICE_STATUS[inv.status].tone}>
                    {INVOICE_STATUS[inv.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-muted">
                  No invoices yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
