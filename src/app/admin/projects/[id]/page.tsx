import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import {
  getCompany,
  getProject,
  getProjectMilestones,
  getThreadData,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { Field, Panel, Submit, inputCls } from "@/components/app/form";
import { StageTimeline } from "@/components/app/stage-timeline";
import { MessageThread } from "@/components/app/message-thread";
import { MarkRead } from "@/components/app/mark-read";
import {
  MILESTONE_STATUS,
  PROJECT_STATUS,
  PROJECT_TYPE_LABEL,
  formatCurrency,
  projectProgress,
  stagesFor,
  type ProjectType,
} from "@/lib/crm";
import {
  addProjectMilestone,
  cancelStageApproval,
  deleteMilestone,
  generateMilestoneInvoice,
  requestStageApproval,
  updateProjectProgress,
} from "@/app/admin/actions";

export default async function AdminProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const company = await getCompany(project.companyId);
  const milestones = await getProjectMilestones(id);
  const thread = await getThreadData(id, user);
  const stages = stagesFor(project.type as ProjectType);
  const { stages: pStages } = projectProgress(project);
  const status = PROJECT_STATUS[project.status];

  const billed = milestones
    .filter((m) => m.status !== "pending")
    .reduce((s, m) => s + m.amount, 0);
  const scheduled = milestones.reduce((s, m) => s + m.amount, 0);

  return (
    <div className="space-y-8">
      <Link
        href={`/admin/clients/${project.companyId}`}
        className="text-sm text-muted hover:text-fg"
      >
        ← {company?.name ?? "Client"}
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-muted">
            {company?.name} · {PROJECT_TYPE_LABEL[project.type as ProjectType]}
          </p>
        </div>
      </header>

      <Panel title="Progress">
        <StageTimeline project={project} />
        <form action={updateProjectProgress} className="mt-6 flex flex-wrap items-end gap-3 border-t border-border pt-5">
          <input type="hidden" name="projectId" value={project.id} />
          <label className="space-y-1 text-xs text-muted">
            <span className="block">Stage</span>
            <select name="stageIndex" defaultValue={project.stageIndex} className={inputCls}>
              {pStages.map((s, i) => (
                <option key={s} value={i}>
                  {i + 1}. {s}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted">
            <span className="block">Status</span>
            <select name="status" defaultValue={project.status} className={inputCls}>
              <option value="active">Active</option>
              <option value="on_hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <Submit>Update progress</Submit>
          <span className="text-xs text-muted">
            Advancing a stage auto-invoices any payment due at it.
          </span>
        </form>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
          {project.awaitingApproval ? (
            <>
              <Badge tone="amber">Awaiting client sign-off</Badge>
              <span className="text-sm text-muted">
                on the {pStages[project.stageIndex]} stage
              </span>
              <form action={cancelStageApproval}>
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-brand/50 hover:text-fg"
                >
                  Cancel request
                </button>
              </form>
            </>
          ) : (
            <form action={requestStageApproval} className="flex items-center gap-3">
              <input type="hidden" name="projectId" value={project.id} />
              <Submit>Request client sign-off</Submit>
              <span className="text-xs text-muted">
                Asks the client to approve the {pStages[project.stageIndex]} stage.
              </span>
            </form>
          )}
        </div>
      </Panel>

      <Panel title="Payment milestones">
        <div className="space-y-2">
          {milestones.map((m) => {
            const ms = MILESTONE_STATUS[m.status];
            return (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg/40 px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Badge tone={ms.tone}>{ms.label}</Badge>
                  <span className="font-medium">{m.label}</span>
                </span>
                <span className="text-muted">
                  {m.triggerStageIndex === null
                    ? "Manual"
                    : `@ ${stages[m.triggerStageIndex] ?? "—"}`}
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-medium">{formatCurrency(m.amount)}</span>
                  {m.status === "pending" && (
                    <form action={generateMilestoneInvoice} className="inline">
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <input type="hidden" name="projectId" value={project.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-brand/50 px-2.5 py-1 text-xs text-brand-soft hover:bg-brand/10"
                      >
                        Invoice now
                      </button>
                    </form>
                  )}
                  {m.status === "pending" && (
                    <form action={deleteMilestone} className="inline">
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <input type="hidden" name="back" value={`/admin/projects/${project.id}`} />
                      <button type="submit" className="text-muted hover:text-red-300" aria-label="Remove">
                        ✕
                      </button>
                    </form>
                  )}
                </span>
              </div>
            );
          })}
          {milestones.length === 0 && (
            <p className="text-sm text-muted">
              No milestones. Add one below, or they appear automatically when a
              quote with a payment schedule is accepted.
            </p>
          )}
        </div>

        {milestones.length > 0 && (
          <p className="mt-3 text-sm text-muted">
            Billed <span className="text-fg">{formatCurrency(billed)}</span> of{" "}
            {formatCurrency(scheduled)} scheduled
          </p>
        )}

        <form
          action={addProjectMilestone}
          className="mt-5 grid items-end gap-3 border-t border-border pt-5 sm:grid-cols-[1fr_120px_1fr_auto]"
        >
          <input type="hidden" name="projectId" value={project.id} />
          <Field label="Add payment (e.g. scope change)">
            <input name="label" required className={inputCls} placeholder="Extra feature — checkout" />
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
      </Panel>

      <MessageThread
        projectId={project.id}
        messages={thread.messages}
        quotes={thread.quotes}
        invoices={thread.invoices}
        project={project}
        attachables={thread.attachables}
        meRole="admin"
      />
      <MarkRead projectId={project.id} />
    </div>
  );
}
