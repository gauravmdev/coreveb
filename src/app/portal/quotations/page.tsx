import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getCompanyQuotations, getQuotationItems } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Submit } from "@/components/app/form";
import {
  PROJECT_TYPE_LABEL,
  QUOTE_STATUS,
  formatCurrency,
  formatDate,
  quoteTotals,
  type ProjectType,
} from "@/lib/crm";
import { acceptQuotation, declineQuotation } from "@/app/portal/actions";

export default async function PortalQuotations() {
  const user = await requireUser();
  const quoteRows = user.companyId
    ? await getCompanyQuotations(user.companyId)
    : [];
  const quotes = await Promise.all(
    quoteRows.map(async (quote) => ({
      quote,
      items: await getQuotationItems(quote.id),
    })),
  );

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Quotations</h1>
        <p className="mt-1 text-muted">
          Review and accept quotes. Accepting one kicks off the project right away.
        </p>
      </header>

      <div className="space-y-4">
        {quotes.map(({ quote, items }) => {
          const { tax, total } = quoteTotals(items, quote.taxRate);
          const pending = quote.status === "sent";

          return (
            <div key={quote.id} className="rounded-2xl border border-border bg-surface/40 p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-muted">{quote.number}</span>
                    <Badge tone={QUOTE_STATUS[quote.status].tone}>
                      {QUOTE_STATUS[quote.status].label}
                    </Badge>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold">{quote.title}</h2>
                  <p className="text-sm text-muted">
                    {PROJECT_TYPE_LABEL[quote.projectType as ProjectType]} project
                    {quote.validUntil ? ` · Valid until ${formatDate(quote.validUntil)}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold tracking-tight">
                    {formatCurrency(total)}
                  </div>
                  {quote.taxRate > 0 && (
                    <div className="text-xs text-muted">
                      incl. {formatCurrency(tax)} tax
                    </div>
                  )}
                </div>
              </div>

              <table className="mt-5 w-full text-sm">
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-border/50">
                      <td className="py-2">{item.description}</td>
                      <td className="py-2 text-right text-muted">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="py-2 text-right">
                        {formatCurrency(item.quantity * item.unitPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {quote.terms && (
                <p className="mt-3 text-xs text-muted">Terms: {quote.terms}</p>
              )}

              {pending && (
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                  <form action={acceptQuotation}>
                    <input type="hidden" name="quotationId" value={quote.id} />
                    <Submit>Accept quote</Submit>
                  </form>
                  <form action={declineQuotation}>
                    <input type="hidden" name="quotationId" value={quote.id} />
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-red-500/40 hover:text-red-300"
                    >
                      Decline
                    </button>
                  </form>
                  <span className="text-xs text-muted">
                    Accepting creates your project and starts the timeline.
                  </span>
                </div>
              )}

              {quote.status === "accepted" && quote.createdProjectId && (
                <Link
                  href={`/portal/projects/${quote.createdProjectId}`}
                  className="mt-5 inline-block border-t border-border pt-5 text-sm text-brand-soft hover:underline"
                >
                  View the project →
                </Link>
              )}
            </div>
          );
        })}
        {quotes.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface/40 p-6 text-sm text-muted">
            No quotations to review right now.
          </p>
        )}
      </div>
    </div>
  );
}
