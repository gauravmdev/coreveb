import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, getQuotation, getQuotationItems } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import {
  PROJECT_TYPE_LABEL,
  QUOTE_STATUS,
  formatCurrency,
  formatDate,
  quoteTotals,
  type ProjectType,
} from "@/lib/crm";
import {
  addQuotationItem,
  deleteQuotationItem,
  setQuotationStatus,
} from "@/app/admin/actions";

export default async function AdminQuotationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = getQuotation(id);
  if (!quote) notFound();

  const company = getCompany(quote.companyId);
  const items = getQuotationItems(id);
  const { subtotal, tax, total } = quoteTotals(items, quote.taxRate);
  const editable = quote.status === "draft" || quote.status === "sent";

  return (
    <div className="space-y-8">
      <Link href="/admin/quotations" className="text-sm text-muted hover:text-fg">
        ← All quotations
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold tracking-tight">
              {quote.number}
            </h1>
            <Badge tone={QUOTE_STATUS[quote.status].tone}>
              {QUOTE_STATUS[quote.status].label}
            </Badge>
          </div>
          <p className="mt-2 text-lg">{quote.title}</p>
          <p className="mt-1 text-sm text-muted">
            {company?.name ?? "—"} · Creates a{" "}
            {PROJECT_TYPE_LABEL[quote.projectType as ProjectType]} project on accept
            {quote.validUntil ? ` · Valid until ${formatDate(quote.validUntil)}` : ""}
          </p>
        </div>

        <form action={setQuotationStatus} className="flex items-end gap-2">
          <input type="hidden" name="quotationId" value={quote.id} />
          <label className="space-y-1 text-xs text-muted">
            <span className="block">Status</span>
            <select name="status" defaultValue={quote.status} className={inputCls}>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted (create project)</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </label>
          <Submit>Update</Submit>
        </form>
      </header>

      {quote.createdProjectId && (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          Accepted — project created.{" "}
          <Link href={`/admin/clients/${quote.companyId}`} className="underline">
            View on client page →
          </Link>
        </p>
      )}

      <Panel title="Line items">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="py-2 font-medium">Description</th>
              <th className="py-2 text-right font-medium">Qty</th>
              <th className="py-2 text-right font-medium">Unit</th>
              <th className="py-2 text-right font-medium">Amount</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/60">
                <td className="py-2.5">{item.description}</td>
                <td className="py-2.5 text-right">{item.quantity}</td>
                <td className="py-2.5 text-right">{formatCurrency(item.unitPrice)}</td>
                <td className="py-2.5 text-right">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
                <td className="py-2.5 text-right">
                  {editable && (
                    <form action={deleteQuotationItem} className="inline">
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="quotationId" value={quote.id} />
                      <button
                        type="submit"
                        className="text-xs text-muted hover:text-red-300"
                        aria-label="Remove line"
                      >
                        ✕
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-center text-muted">
                  No line items yet.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="text-sm">
              <td colSpan={3} className="pt-4 text-right text-muted">Subtotal</td>
              <td className="pt-4 text-right">{formatCurrency(subtotal)}</td>
              <td />
            </tr>
            {quote.taxRate > 0 && (
              <tr className="text-sm">
                <td colSpan={3} className="pt-1 text-right text-muted">
                  Tax ({quote.taxRate}%)
                </td>
                <td className="pt-1 text-right">{formatCurrency(tax)}</td>
                <td />
              </tr>
            )}
            <tr className="font-semibold">
              <td colSpan={3} className="pt-2 text-right">Total</td>
              <td className="pt-2 text-right">{formatCurrency(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>

        {editable && (
          <form
            action={addQuotationItem}
            className="mt-5 grid items-end gap-3 border-t border-border pt-5 sm:grid-cols-[1fr_90px_120px_auto]"
          >
            <input type="hidden" name="quotationId" value={quote.id} />
            <Field label="Description">
              <input name="description" required className={inputCls} placeholder="Design & build" />
            </Field>
            <Field label="Qty">
              <input name="quantity" type="number" min="0" step="0.5" defaultValue={1} className={inputCls} />
            </Field>
            <Field label="Unit price">
              <input name="unitPrice" type="number" min="0" className={inputCls} placeholder="0" />
            </Field>
            <Submit>Add</Submit>
          </form>
        )}
      </Panel>

      {quote.terms && (
        <p className="text-sm text-muted">
          <span className="font-medium text-fg">Terms:</span> {quote.terms}
        </p>
      )}
    </div>
  );
}
