import { listCompanies, listDeals } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Submit, inputCls } from "@/components/app/form";
import { DEAL_STAGE, DEAL_STAGES, formatCurrency } from "@/lib/crm";
import { PageHeader } from "@/components/app/ui";
import { Drawer } from "@/components/app/drawer";
import { createDeal, setDealStage } from "@/app/admin/actions";

export default async function AdminDeals() {
  const rows = await listDeals();
  const companies = await listCompanies();

  const pipelineValue = rows
    .filter((r) => r.deal.stage !== "lost" && r.deal.stage !== "won")
    .reduce((s, r) => s + r.deal.value, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" description={`${formatCurrency(pipelineValue)} in open pipeline.`}>
        <Drawer label="New deal" title="New deal" description="Track an opportunity.">
          <form action={createDeal} className="space-y-4">
            <Field label="Title">
              <input name="title" required className={inputCls} placeholder="Loyalty platform" />
            </Field>
            <Field label="Company">
              <select name="companyId" className={inputCls} defaultValue="">
                <option value="">— Prospect (no company) —</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Value (₹)">
              <input name="value" type="number" min="0" className={inputCls} placeholder="100000" />
            </Field>
            <Field label="Stage">
              <select name="stage" className={inputCls} defaultValue="lead">
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {DEAL_STAGE[s].label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Contact email">
              <input name="contactEmail" type="email" className={inputCls} placeholder="name@company.com" />
            </Field>
            <Submit>Create deal</Submit>
          </form>
        </Drawer>
      </PageHeader>

      <div className="hidden overflow-x-auto rounded-2xl border border-border bg-surface/40 shadow-sm sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-5 py-3.5 font-medium">Deal</th>
              <th className="px-5 py-3.5 font-medium">Company</th>
              <th className="px-5 py-3.5 text-right font-medium">Value</th>
              <th className="px-5 py-3.5 font-medium">Stage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ deal, companyName }) => (
              <tr
                key={deal.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-bg/40"
              >
                <td className="px-5 py-3.5">
                  <div className="font-medium">{deal.title}</div>
                  <div className="text-xs text-muted">{deal.contactEmail ?? "—"}</div>
                </td>
                <td className="px-5 py-3.5 text-muted">{companyName ?? "—"}</td>
                <td className="px-5 py-3.5 text-right">{formatCurrency(deal.value)}</td>
                <td className="px-5 py-3.5">
                  <form action={setDealStage} className="flex items-center gap-2">
                    <input type="hidden" name="dealId" value={deal.id} />
                    <Badge tone={DEAL_STAGE[deal.stage].tone}>
                      {DEAL_STAGE[deal.stage].label}
                    </Badge>
                    <select name="stage" defaultValue={deal.stage} className={`${inputCls} w-auto py-1`}>
                      {DEAL_STAGES.map((s) => (
                        <option key={s} value={s}>
                          {DEAL_STAGE[s].label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-2.5 py-1 text-xs hover:border-brand/50"
                    >
                      Move
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-muted">
                  No deals yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards on mobile */}
      <div className="space-y-3 sm:hidden">
        {rows.map(({ deal, companyName }) => (
          <div key={deal.id} className="rounded-2xl border border-border bg-surface/40 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium">{deal.title}</span>
              <span className="font-semibold">{formatCurrency(deal.value)}</span>
            </div>
            <div className="mt-1 text-xs text-muted">
              {companyName ?? "—"}
              {deal.contactEmail ? ` · ${deal.contactEmail}` : ""}
            </div>
            <form action={setDealStage} className="mt-3 flex items-center gap-2">
              <input type="hidden" name="dealId" value={deal.id} />
              <Badge tone={DEAL_STAGE[deal.stage].tone}>{DEAL_STAGE[deal.stage].label}</Badge>
              <select name="stage" defaultValue={deal.stage} className={`${inputCls} w-auto flex-1 py-1`}>
                {DEAL_STAGES.map((s) => (
                  <option key={s} value={s}>
                    {DEAL_STAGE[s].label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1 text-xs hover:border-brand/50"
              >
                Move
              </button>
            </form>
          </div>
        ))}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted">
            No deals yet.
          </p>
        )}
      </div>
    </div>
  );
}
