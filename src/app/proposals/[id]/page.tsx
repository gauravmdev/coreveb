import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import {
  getCompany,
  getProposalSections,
  getQuotation,
  getQuotationItems,
  getQuotationMilestones,
} from "@/lib/queries";
import { formatCurrency, formatDate } from "@/lib/crm";
import { site } from "@/lib/site";
import { Prose } from "@/components/proposal/prose";
import { PrintButton } from "@/components/proposal/print-button";

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const quote = await getQuotation(id);
  if (!quote) notFound();
  // Authorization: admins see any; clients only their own company's proposal.
  if (user.role !== "admin" && quote.companyId !== user.companyId) notFound();

  const company = await getCompany(quote.companyId);
  const items = await getQuotationItems(id);
  const milestones = await getQuotationMilestones(id);
  const sections = await getProposalSections(id);

  const cur = quote.currency;
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = subtotal * (quote.taxRate / 100);
  const total = subtotal + tax;
  const money = (n: number) => formatCurrency(n, cur);

  const backHref =
    user.role === "admin" ? `/admin/quotations/${id}` : "/portal/quotations";

  return (
    <div className="bg-slate-200 pb-10 print:bg-white print:pb-0">
      {/* Toolbar (screen only) */}
      <div className="no-print sticky top-0 z-10 mb-6 flex items-center justify-between bg-slate-900 px-5 py-3 text-white sm:mx-auto sm:mt-6 sm:max-w-[820px] sm:rounded-xl">
        <Link href={backHref} className="text-sm text-slate-300 hover:text-white">
          ← Back
        </Link>
        <span className="text-sm text-slate-400">
          Proposal {quote.number} · use “Save as PDF” in the print dialog
        </span>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[820px] bg-white text-slate-800 shadow-xl">
        {/* ---------- Cover ---------- */}
        <section className="proposal-page print-bg flex h-[1120px] flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 to-teal-700 p-14 text-white">
          <Image
            src="/coreveb-logo-dark.png"
            alt="Coreveb"
            width={1110}
            height={397}
            className="h-20 w-auto self-start"
            priority
          />

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
              Proposal
            </p>
            <h1 className="mt-4 text-5xl font-bold leading-tight">{quote.title}</h1>
            {quote.subtitle && (
              <p className="mt-4 max-w-lg text-xl text-teal-50/90">{quote.subtitle}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-white/20 pt-8 text-sm">
            <div>
              <p className="font-semibold uppercase tracking-widest text-teal-200">
                Prepared for
              </p>
              <p className="mt-2 text-base">{company?.name}</p>
              {company?.contactName && (
                <p className="text-teal-50/80">{company.contactName}</p>
              )}
            </div>
            <div>
              <p className="font-semibold uppercase tracking-widest text-teal-200">
                Prepared by
              </p>
              <p className="mt-2 text-base font-semibold">{site.name}</p>
              <p className="text-teal-50/80">
                {site.url.replace("https://", "")} · {site.email}
              </p>
            </div>
            <div className="col-span-2 text-teal-100/70">
              {quote.validUntil
                ? `Valid until ${formatDate(quote.validUntil)} · `
                : ""}
              Confidential
            </div>
          </div>
        </section>

        {/* ---------- Narrative sections ---------- */}
        {sections.map((s, i) => (
          <section key={s.id} className="proposal-page p-14">
            <SectionLabel n={i + 1} />
            <h2 className="mt-3 text-3xl font-bold text-slate-900">{s.heading}</h2>
            <div className="mt-3 h-1 w-12 rounded bg-teal-600" />
            <div className="mt-8">
              <Prose text={s.body} />
            </div>
            <Footer name={quote.title} />
          </section>
        ))}

        {/* ---------- Commercial ---------- */}
        <section className="proposal-page p-14">
          <SectionLabel n={sections.length + 1} />
          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Commercial Proposal
          </h2>
          <div className="mt-3 h-1 w-12 rounded bg-teal-600" />

          <table className="mt-8 w-full text-sm">
            <thead>
              <tr className="print-bg bg-teal-800 text-left text-xs uppercase tracking-wider text-white">
                <th className="rounded-l-lg px-4 py-3 font-semibold">Module</th>
                <th className="px-4 py-3 font-semibold">Description</th>
                <th className="rounded-r-lg px-4 py-3 text-right font-semibold">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {it.description}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {it.quantity > 1 ? `${it.quantity} × ${money(it.unitPrice)}` : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {money(it.quantity * it.unitPrice)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {quote.taxRate > 0 && (
                <>
                  <tr>
                    <td colSpan={2} className="px-4 pt-4 text-right text-slate-500">
                      Subtotal
                    </td>
                    <td className="px-4 pt-4 text-right">{money(subtotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="px-4 py-1 text-right text-slate-500">
                      {quote.taxLabel} ({quote.taxRate}%)
                    </td>
                    <td className="px-4 py-1 text-right">{money(tax)}</td>
                  </tr>
                </>
              )}
              <tr className="print-bg bg-teal-900 text-white">
                <td colSpan={2} className="rounded-l-lg px-4 py-3 font-semibold">
                  Total project cost
                </td>
                <td className="rounded-r-lg px-4 py-3 text-right text-lg font-bold">
                  {money(total)}
                </td>
              </tr>
            </tfoot>
          </table>

          {milestones.length > 0 && (
            <>
              <h3 className="mt-10 text-lg font-semibold text-teal-800">
                Payment schedule
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-xl border border-slate-200 p-4 text-center"
                  >
                    <div className="text-2xl font-bold text-teal-700">
                      {total > 0 ? Math.round((m.amount / total) * 100) : 0}%
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{m.label}</div>
                    <div className="mt-1 text-sm font-medium text-slate-700">
                      {money(m.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="mt-8 text-xs text-slate-400">
            All amounts in {cur}
            {quote.taxRate > 0 ? `, exclusive of ${quote.taxLabel} (${quote.taxRate}%)` : ""}.
            Fixed for the scope defined in this proposal.
          </p>
          <Footer name={quote.title} />
        </section>

        {/* ---------- Closing ---------- */}
        <section className="proposal-page print-bg flex h-[1120px] flex-col justify-between overflow-hidden bg-gradient-to-br from-teal-900 to-teal-700 p-14 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-200">
            Let&apos;s build it
          </p>
          <div>
            <h2 className="text-5xl font-bold">Ready to start.</h2>
            <p className="mt-6 max-w-md text-lg text-teal-50/90">
              If this works for your team, reply to this proposal or reach us at{" "}
              {site.email}{" "}and we&apos;ll share a kickoff plan and the advance
              invoice.
            </p>
          </div>
          <div className="border-t border-white/20 pt-6 text-sm text-teal-100/80">
            <Image
              src="/coreveb-logo-dark.png"
              alt="Coreveb"
              width={1110}
              height={397}
              className="mb-4 h-12 w-auto"
            />
            {site.url.replace("https://", "")} · {site.email}
          </div>
        </section>
      </article>
    </div>
  );
}

function SectionLabel({ n }: { n: number }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">
      Section {String(n).padStart(2, "0")}
    </p>
  );
}

function Footer({ name }: { name: string }) {
  return (
    <p className="mt-12 border-t border-slate-100 pt-4 text-xs text-slate-400">
      Coreveb · {name} · Confidential
    </p>
  );
}
