import { listCompanies, listDeals } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import {
  DEAL_STAGE,
  DEAL_STAGES,
  formatCurrency,
} from "@/lib/crm";
import { createDeal, setDealStage } from "@/app/admin/actions";

export default async function AdminDeals() {
  const rows = await listDeals();
  const companies = await listCompanies();

  const pipelineValue = rows
    .filter((r) => r.deal.stage !== "lost" && r.deal.stage !== "won")
    .reduce((s, r) => s + r.deal.value, 0);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Deals</h1>
          <p className="mt-1 text-muted">
            {formatCurrency(pipelineValue)} in open pipeline.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/40 text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-5 py-3 font-medium">Deal</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 text-right font-medium">Value</th>
                <th className="px-5 py-3 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ deal, companyName }) => (
                <tr key={deal.id} className="border-b border-border/60 last:border-0">
                  <td className="px-5 py-3">
                    <div className="font-medium">{deal.title}</div>
                    <div className="text-xs text-muted">{deal.contactEmail ?? "—"}</div>
                  </td>
                  <td className="px-5 py-3 text-muted">{companyName ?? "—"}</td>
                  <td className="px-5 py-3 text-right">{formatCurrency(deal.value)}</td>
                  <td className="px-5 py-3">
                    <form action={setDealStage} className="flex items-center gap-2">
                      <input type="hidden" name="dealId" value={deal.id} />
                      <Badge tone={DEAL_STAGE[deal.stage].tone}>
                        {DEAL_STAGE[deal.stage].label}
                      </Badge>
                      <select
                        name="stage"
                        defaultValue={deal.stage}
                        className={`${inputCls} w-auto py-1`}
                      >
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
                  <td colSpan={4} className="px-5 py-6 text-center text-muted">
                    No deals yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Panel title="New deal">
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
            <Field label="Value (USD)">
              <input name="value" type="number" min="0" className={inputCls} placeholder="10000" />
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
        </Panel>
      </div>
    </div>
  );
}
