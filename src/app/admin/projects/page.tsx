import Link from "next/link";
import { listProjectsWithCompany } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Panel, Submit, inputCls } from "@/components/app/form";
import {
  PROJECT_STATUS,
  PROJECT_TYPE_LABEL,
  formatDate,
  projectProgress,
  type ProjectType,
} from "@/lib/crm";
import { PageHeader } from "@/components/app/ui";
import { updateProjectProgress } from "@/app/admin/actions";

export default async function AdminProjects() {
  const rows = await listProjectsWithCompany();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Move projects through their stages — clients see this instantly."
      />


      <div className="space-y-4">
        {rows.map(({ project: p, companyName }) => {
          const { stages, currentStage, pct } = projectProgress(p);
          const status = PROJECT_STATUS[p.status];
          return (
            <Panel key={p.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{p.name}</h3>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {companyName ?? "—"} ·{" "}
                    {PROJECT_TYPE_LABEL[p.type as ProjectType]} ·{" "}
                    <span className="text-brand-soft">{currentStage}</span> ({pct}%)
                    {p.targetDate ? ` · Target ${formatDate(p.targetDate)}` : ""}
                  </p>
                </div>
              </div>

              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand to-accent"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <form action={updateProjectProgress} className="mt-4 flex flex-wrap items-end gap-3">
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
                <Submit>Update progress</Submit>
                <Link
                  href={`/admin/projects/${p.id}`}
                  className="text-sm text-brand-soft hover:underline"
                >
                  Milestones & billing →
                </Link>
              </form>
            </Panel>
          );
        })}
        {rows.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface/40 p-6 text-sm text-muted">
            No projects yet. Create one from a client&apos;s page.
          </p>
        )}
      </div>
    </div>
  );
}
