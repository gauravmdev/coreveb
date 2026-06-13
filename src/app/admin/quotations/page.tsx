import Link from "next/link";
import {
  listCompanies,
  listDeals,
  listQuotations,
  quotationTotals,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Submit, inputCls } from "@/components/app/form";
import { QUOTE_STATUS, formatCurrency } from "@/lib/crm";
import { PageHeader } from "@/components/app/ui";
import { Drawer } from "@/components/app/drawer";
import { createQuotation } from "@/app/admin/actions";

export default async function AdminQuotations() {
  const rows = await listQuotations();
  const companies = await listCompanies();
  const deals = await listDeals();
  const totals = await quotationTotals();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        description="Send a quote; when the client accepts it, a project is created automatically."
      >
        <Drawer
          label="New quotation"
          title="New quotation"
          description="Draft a quote and add line items next."
        >
          <form action={createQuotation} className="space-y-4">
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
            <Field label="Title">
              <input name="title" required className={inputCls} placeholder="Storefront rebuild" />
            </Field>
            <Field label="Project type (created on accept)">
              <select name="projectType" className={inputCls} defaultValue="web">
                <option value="software">Software</option>
                <option value="web">Web App</option>
                <option value="mobile">Mobile App</option>
                <option value="marketing">Marketing</option>
              </select>
            </Field>
            <Field label="Link deal (optional)">
              <select name="dealId" className={inputCls} defaultValue="">
                <option value="">— None —</option>
                {deals.map(({ deal, companyName }) => (
                  <option key={deal.id} value={deal.id}>
                    {deal.title}
                    {companyName ? ` · ${companyName}` : ""}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tax %">
                <input name="taxRate" type="number" min="0" step="0.1" className={inputCls} placeholder="0" />
              </Field>
              <Field label="Valid until">
                <input name="validUntil" type="date" className={inputCls} />
              </Field>
            </div>
            <Field label="Terms (optional)">
              <input name="terms" className={inputCls} placeholder="50% upfront, net-15" />
            </Field>
            <Submit>Create &amp; add items</Submit>
          </form>
        </Drawer>
      </PageHeader>

      {/* Table on sm+ */}
      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface/40 shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-medium">Quote</th>
              <th className="px-5 py-3.5 font-medium">Client</th>
              <th className="px-5 py-3.5 text-right font-medium">Total</th>
              <th className="px-5 py-3.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ quote, companyName }) => {
              const subtotal = totals.get(quote.id) ?? 0;
              const total = subtotal * (1 + quote.taxRate / 100);
              return (
                <tr
                  key={quote.id}
                  className="border-b border-border/60 transition-colors last:border-0 hover:bg-bg/40"
                >
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/quotations/${quote.id}`}
                      className="font-mono text-muted hover:text-brand-soft"
                    >
                      {quote.number}
                    </Link>
                    <div className="text-xs text-muted">{quote.title}</div>
                  </td>
                  <td className="px-5 py-3.5">{companyName ?? "—"}</td>
                  <td className="px-5 py-3.5 text-right">{formatCurrency(total)}</td>
                  <td className="px-5 py-3.5">
                    <Badge tone={QUOTE_STATUS[quote.status].tone}>
                      {QUOTE_STATUS[quote.status].label}
                    </Badge>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  No quotations yet — create one to send a quote.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on mobile */}
      <div className="space-y-3 sm:hidden">
        {rows.map(({ quote, companyName }) => {
          const subtotal = totals.get(quote.id) ?? 0;
          const total = subtotal * (1 + quote.taxRate / 100);
          return (
            <Link
              key={quote.id}
              href={`/admin/quotations/${quote.id}`}
              className="block rounded-2xl border border-border bg-surface/40 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-muted">{quote.number}</span>
                <Badge tone={QUOTE_STATUS[quote.status].tone}>
                  {QUOTE_STATUS[quote.status].label}
                </Badge>
              </div>
              <div className="mt-1 font-medium">{quote.title}</div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted">
                <span>{companyName ?? "—"}</span>
                <span className="font-medium text-fg">{formatCurrency(total)}</span>
              </div>
            </Link>
          );
        })}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted">
            No quotations yet — create one to send a quote.
          </p>
        )}
      </div>
    </div>
  );
}
