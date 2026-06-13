import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompany,
  getProposalSections,
  getQuotation,
  getQuotationItems,
  getQuotationMilestones,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import {
  PROJECT_TYPE_LABEL,
  QUOTE_STATUS,
  formatCurrency,
  formatDate,
  quoteTotals,
  stagesFor,
  type ProjectType,
} from "@/lib/crm";
import {
  addProposalSection,
  addQuotationItem,
  addQuotationMilestone,
  deleteMilestone,
  deleteProposalSection,
  deleteQuotationItem,
  setQuotationStatus,
  updateProposalMeta,
} from "@/app/admin/actions";

export default async function AdminQuotationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuotation(id);
  if (!quote) notFound();

  const company = await getCompany(quote.companyId);
  const items = await getQuotationItems(id);
  const { subtotal, tax, total } = quoteTotals(items, quote.taxRate);
  const editable = quote.status === "draft" || quote.status === "sent";

  const schedule = await getQuotationMilestones(id);
  const stages = stagesFor(quote.projectType as ProjectType);
  const scheduled = schedule.reduce((s, m) => s + m.amount, 0);
  const sections = await getProposalSections(id);

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
          <Link
            href={`/proposals/${quote.id}`}
            target="_blank"
            className="mt-3 inline-flex items-center gap-1 rounded-full border border-brand/50 px-4 py-1.5 text-sm font-medium text-brand-soft hover:bg-brand/10"
          >
            Open proposal document →
          </Link>
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

      <Panel title="Payment schedule">
        <p className="mb-4 text-sm text-muted">
          Define stage-based payments. On acceptance a project is created and
          each payment is invoiced automatically when the project reaches its
          trigger stage. Use <span className="text-fg">Manual</span> for
          scope-change or ad-hoc amounts you&apos;ll invoice yourself.
        </p>

        <div className="space-y-2">
          {schedule.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-bg/40 px-4 py-3 text-sm"
            >
              <span className="font-medium">{m.label}</span>
              <span className="text-muted">
                {m.triggerStageIndex === null
                  ? "Manual"
                  : `When reaching: ${stages[m.triggerStageIndex] ?? "—"}`}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-medium">{formatCurrency(m.amount)}</span>
                {editable && (
                  <form action={deleteMilestone} className="inline">
                    <input type="hidden" name="milestoneId" value={m.id} />
                    <input type="hidden" name="back" value={`/admin/quotations/${quote.id}`} />
                    <button type="submit" className="text-muted hover:text-red-300" aria-label="Remove">
                      ✕
                    </button>
                  </form>
                )}
              </span>
            </div>
          ))}
          {schedule.length === 0 && (
            <p className="text-sm text-muted">No payments scheduled yet.</p>
          )}
        </div>

        <p className="mt-3 text-sm text-muted">
          Scheduled <span className="text-fg">{formatCurrency(scheduled)}</span>{" "}
          of {formatCurrency(total)} quote total
          {Math.abs(scheduled - total) > 0.5 && (
            <span className="text-amber-300">
              {" "}· {formatCurrency(Math.abs(total - scheduled))}{" "}
              {scheduled > total ? "over" : "unallocated"}
            </span>
          )}
        </p>

        {editable && (
          <form
            action={addQuotationMilestone}
            className="mt-5 grid items-end gap-3 border-t border-border pt-5 sm:grid-cols-[1fr_120px_1fr_auto]"
          >
            <input type="hidden" name="quotationId" value={quote.id} />
            <Field label="Payment for">
              <input name="label" required className={inputCls} placeholder="Start of work" />
            </Field>
            <Field label="Amount">
              <input name="amount" type="number" min="0" className={inputCls} placeholder="0" />
            </Field>
            <Field label="Trigger">
              <select name="triggerStageIndex" className={inputCls} defaultValue="">
                <option value="">Manual (invoice yourself)</option>
                {stages.map((s, i) => (
                  <option key={s} value={i}>
                    When reaching: {s}
                  </option>
                ))}
              </select>
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

      <Panel title="Proposal document">
        <p className="mb-4 text-sm text-muted">
          These become the narrative pages of the printable proposal, alongside
          the commercial table and payment schedule above. Use{" "}
          <span className="text-fg">## </span> for a sub-heading and{" "}
          <span className="text-fg">- </span> at the start of a line for a bullet.
        </p>

        <form action={updateProposalMeta} className="grid gap-3 sm:grid-cols-[1fr_140px_140px_auto]">
          <input type="hidden" name="quotationId" value={quote.id} />
          <Field label="Cover subtitle">
            <input
              name="subtitle"
              defaultValue={quote.subtitle ?? ""}
              className={inputCls}
              placeholder="Design, development & store launch"
            />
          </Field>
          <Field label="Currency">
            <select name="currency" defaultValue={quote.currency} className={inputCls}>
              <option value="INR">INR ₹</option>
              <option value="USD">USD $</option>
              <option value="EUR">EUR €</option>
              <option value="GBP">GBP £</option>
            </select>
          </Field>
          <Field label="Tax label">
            <input name="taxLabel" defaultValue={quote.taxLabel} className={inputCls} />
          </Field>
          <Submit>Save</Submit>
        </form>

        <div className="mt-6 space-y-2 border-t border-border pt-6">
          {sections.map((s) => (
            <div
              key={s.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-bg/40 p-4"
            >
              <div>
                <div className="font-medium">{s.heading}</div>
                <div className="mt-1 line-clamp-2 text-xs text-muted">{s.body}</div>
              </div>
              <form action={deleteProposalSection}>
                <input type="hidden" name="sectionId" value={s.id} />
                <input type="hidden" name="quotationId" value={quote.id} />
                <button type="submit" className="text-muted hover:text-red-300" aria-label="Remove section">
                  ✕
                </button>
              </form>
            </div>
          ))}
          {sections.length === 0 && (
            <p className="text-sm text-muted">No sections yet.</p>
          )}
        </div>

        <form action={addProposalSection} className="mt-5 space-y-3 border-t border-border pt-5">
          <input type="hidden" name="quotationId" value={quote.id} />
          <Field label="Section heading">
            <input name="heading" required className={inputCls} placeholder="Understanding the Brief" />
          </Field>
          <Field label="Section body">
            <textarea
              name="body"
              required
              rows={5}
              className={inputCls}
              placeholder={"Plain paragraphs…\n\n## A sub-heading\n- A bullet point\n- Another bullet"}
            />
          </Field>
          <Submit>Add section</Submit>
        </form>
      </Panel>
    </div>
  );
}
