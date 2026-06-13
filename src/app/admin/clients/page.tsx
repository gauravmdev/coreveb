import Link from "next/link";
import { listCompanies } from "@/lib/queries";
import { formatDate } from "@/lib/crm";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import { PageHeader } from "@/components/app/ui";
import { createCompany } from "@/app/admin/actions";

export default async function AdminClients() {
  const companies = await listCompanies();

  return (
    <div className="space-y-8">
      <PageHeader title="Clients" description="Companies you work with." />


      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {/* Table on sm+ */}
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/40 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3 font-medium">Company</th>
                  <th className="px-5 py-3 font-medium">Contact</th>
                  <th className="px-5 py-3 font-medium">Added</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-border/60 last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/admin/clients/${c.id}`} className="font-medium hover:text-brand-soft">
                        {c.name}
                      </Link>
                      <div className="text-xs text-muted">{c.industry ?? "—"}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{c.contactEmail ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-6 text-center text-muted">
                      No clients yet — add your first one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Cards on mobile */}
          <div className="space-y-3 sm:hidden">
            {companies.map((c) => (
              <Link
                key={c.id}
                href={`/admin/clients/${c.id}`}
                className="block rounded-2xl border border-border bg-surface/40 p-4"
              >
                <div className="font-medium">{c.name}</div>
                <div className="mt-1 text-xs text-muted">
                  {c.industry ?? "—"} · {c.contactEmail ?? "no contact"}
                </div>
                <div className="mt-1 text-xs text-muted">Added {formatDate(c.createdAt)}</div>
              </Link>
            ))}
            {companies.length === 0 && (
              <p className="rounded-2xl border border-border bg-surface/40 p-4 text-sm text-muted">
                No clients yet — add your first one.
              </p>
            )}
          </div>
        </div>

        <Panel title="Add client">
          <form action={createCompany} className="space-y-4">
            <Field label="Company name">
              <input name="name" required className={inputCls} placeholder="Acme Inc." />
            </Field>
            <Field label="Industry">
              <input name="industry" className={inputCls} placeholder="Retail" />
            </Field>
            <Field label="Website">
              <input name="website" className={inputCls} placeholder="https://" />
            </Field>
            <Field label="Contact name">
              <input name="contactName" className={inputCls} placeholder="Jane Doe" />
            </Field>
            <Field label="Contact email">
              <input name="contactEmail" type="email" className={inputCls} placeholder="jane@acme.com" />
            </Field>
            <Submit>Create client</Submit>
          </form>
        </Panel>
      </div>
    </div>
  );
}
