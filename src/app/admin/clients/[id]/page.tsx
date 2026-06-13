import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompany,
  getCompanyInvoices,
  getCompanyNotes,
  getCompanyProjects,
  getCompanyUsers,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import {
  INVOICE_STATUS,
  PROJECT_STATUS,
  PROJECT_TYPE_LABEL,
  formatCurrency,
  formatDate,
  projectProgress,
  type ProjectType,
} from "@/lib/crm";
import {
  addNote,
  createProject,
  linkUser,
  updateProjectProgress,
} from "@/app/admin/actions";

export default async function AdminClientDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const projects = await getCompanyProjects(id);
  const invoices = await getCompanyInvoices(id);
  const members = await getCompanyUsers(id);
  const notes = await getCompanyNotes(id);

  return (
    <div className="space-y-8">
      <Link href="/admin/clients" className="text-sm text-muted hover:text-fg">
        ← All clients
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{company.name}</h1>
        <p className="mt-1 text-muted">
          {[company.industry, company.contactEmail, company.website]
            .filter(Boolean)
            .join(" · ") || "—"}
        </p>
      </header>

      {/* Projects with progress controls */}
      <Panel title="Projects">
        <div className="space-y-4">
          {projects.map((p) => {
            const { stages, currentStage } = projectProgress(p);
            const status = PROJECT_STATUS[p.status];
            return (
              <div key={p.id} className="rounded-xl border border-border bg-bg/40 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects/${p.id}`}
                      className="font-medium hover:text-brand-soft"
                    >
                      {p.name}
                    </Link>
                    <Badge tone={status.tone}>{status.label}</Badge>
                    <span className="text-xs text-muted">
                      {PROJECT_TYPE_LABEL[p.type as ProjectType]} · {currentStage}
                    </span>
                  </div>
                </div>
                <form
                  action={updateProjectProgress}
                  className="mt-3 flex flex-wrap items-end gap-3"
                >
                  <input type="hidden" name="projectId" value={p.id} />
                  <label className="space-y-1 text-xs text-muted">
                    <span className="block">Stage</span>
                    <select name="stageIndex" defaultValue={p.stageIndex} className={inputCls}>
                      {stages.map((s, i) => (
                        <option key={s} value={i}>
                          {i + 1}. {s}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1 text-xs text-muted">
                    <span className="block">Status</span>
                    <select name="status" defaultValue={p.status} className={inputCls}>
                      <option value="active">Active</option>
                      <option value="on_hold">On hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>
                  <Submit>Update</Submit>
                </form>
              </div>
            );
          })}
          {projects.length === 0 && (
            <p className="text-sm text-muted">No projects yet.</p>
          )}
        </div>

        <form
          action={createProject}
          className="mt-6 grid gap-3 border-t border-border pt-6 sm:grid-cols-2"
        >
          <input type="hidden" name="companyId" value={company.id} />
          <Field label="Project name">
            <input name="name" required className={inputCls} placeholder="New website" />
          </Field>
          <Field label="Type">
            <select name="type" className={inputCls} defaultValue="web">
              <option value="software">Software</option>
              <option value="web">Web App</option>
              <option value="mobile">Mobile App</option>
              <option value="marketing">Marketing</option>
            </select>
          </Field>
          <Field label="Target date">
            <input name="targetDate" type="date" className={inputCls} />
          </Field>
          <Field label="Description">
            <input name="description" className={inputCls} placeholder="Short summary" />
          </Field>
          <div className="sm:col-span-2">
            <Submit>Add project</Submit>
          </div>
        </form>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team / portal access */}
        <Panel title="Portal access">
          <ul className="space-y-2">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <span>{m.email}</span>
                <Badge tone={m.role === "admin" ? "amber" : "muted"}>{m.role}</Badge>
              </li>
            ))}
            {members.length === 0 && (
              <li className="text-sm text-muted">No users linked yet.</li>
            )}
          </ul>
          <form action={linkUser} className="mt-4 flex items-end gap-2 border-t border-border pt-4">
            <input type="hidden" name="companyId" value={company.id} />
            <Field label="Invite by email">
              <input name="email" type="email" required className={inputCls} placeholder="client@company.com" />
            </Field>
            <Submit>Link</Submit>
          </form>
        </Panel>

        {/* Invoices */}
        <Panel title="Invoices">
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between text-sm">
                <span className="font-mono text-muted">{inv.number}</span>
                <span>{formatCurrency(inv.amount)}</span>
                <Badge tone={INVOICE_STATUS[inv.status].tone}>
                  {INVOICE_STATUS[inv.status].label}
                </Badge>
              </div>
            ))}
            {invoices.length === 0 && (
              <p className="text-sm text-muted">No invoices.</p>
            )}
          </div>
          <Link
            href="/admin/invoices"
            className="mt-4 inline-block border-t border-border pt-4 text-sm text-brand-soft hover:underline"
          >
            Manage invoices →
          </Link>
        </Panel>
      </div>

      {/* Notes / updates */}
      <Panel title="Notes & updates">
        <form action={addNote} className="space-y-3">
          <input type="hidden" name="companyId" value={company.id} />
          <textarea
            name="body"
            required
            rows={3}
            className={inputCls}
            placeholder="Add an internal note or a client-facing update…"
          />
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-xs text-muted">
              <span className="mb-1 block">Attach to project</span>
              <select name="projectId" className={inputCls} defaultValue="">
                <option value="">— None —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="visibleToClient" className="h-4 w-4 accent-[var(--color-brand)]" />
              Share with client
            </label>
            <Submit>Add note</Submit>
          </div>
        </form>

        <ul className="mt-6 space-y-3 border-t border-border pt-6">
          {notes.map((n) => (
            <li key={n.id} className="rounded-xl border border-border bg-bg/40 p-4">
              <p className="text-sm">{n.body}</p>
              <p className="mt-1 text-xs text-muted">
                {n.authorName ?? "Coreveb"} · {formatDate(n.createdAt)} ·{" "}
                {n.visibleToClient ? "shared with client" : "internal"}
              </p>
            </li>
          ))}
          {notes.length === 0 && <li className="text-sm text-muted">No notes yet.</li>}
        </ul>
      </Panel>
    </div>
  );
}
