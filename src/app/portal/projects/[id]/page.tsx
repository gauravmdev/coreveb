import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import {
  getProject,
  getProjectMessages,
  getProjectMilestones,
  getProjectNotes,
} from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { StageTimeline } from "@/components/app/stage-timeline";
import { MessageThread } from "@/components/app/message-thread";
import { MarkRead } from "@/components/app/mark-read";
import { approveStage, requestStageChanges } from "@/app/portal/actions";
import {
  MILESTONE_STATUS,
  PROJECT_STATUS,
  PROJECT_TYPE_LABEL,
  formatCurrency,
  formatDate,
  stagesFor,
  type ProjectType,
} from "@/lib/crm";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getProject(id);

  // Authorization: clients can only view their own company's projects.
  if (!project || project.companyId !== user.companyId) notFound();

  const status = PROJECT_STATUS[project.status];
  const updates = await getProjectNotes(project.id, true);
  const milestones = await getProjectMilestones(project.id);
  const thread = await getProjectMessages(project.id);
  const stages = stagesFor(project.type as ProjectType);

  return (
    <div className="space-y-8">
      <Link href="/portal" className="text-sm text-muted hover:text-fg">
        ← Back to overview
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight">{project.name}</h1>
            <Badge tone={status.tone}>{status.label}</Badge>
          </div>
          <p className="mt-2 text-muted">
            {PROJECT_TYPE_LABEL[project.type as ProjectType]}
            {project.startedAt ? ` · Started ${formatDate(project.startedAt)}` : ""}
            {project.targetDate ? ` · Target ${formatDate(project.targetDate)}` : ""}
          </p>
        </div>
      </header>

      {project.description && (
        <p className="max-w-2xl text-muted">{project.description}</p>
      )}

      <section className="rounded-2xl border border-border bg-surface/40 p-7">
        <h2 className="mb-6 text-lg font-semibold">Progress</h2>
        <StageTimeline project={project} />

        {project.awaitingApproval && (
          <div className="mt-6 rounded-xl border border-brand/40 bg-brand/10 p-5">
            <p className="text-sm">
              <span className="font-semibold text-fg">Your sign-off is requested</span>{" "}
              on the{" "}
              <span className="text-brand-soft">
                {stages[project.stageIndex] ?? "current"}
              </span>{" "}
              stage. Approving moves the project to the next stage.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <form action={approveStage}>
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  className="sheen rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-soft"
                >
                  Approve &amp; continue
                </button>
              </form>
              <form action={requestStageChanges}>
                <input type="hidden" name="projectId" value={project.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-amber-500/50 hover:text-amber-300"
                >
                  Request changes
                </button>
              </form>
            </div>
          </div>
        )}
      </section>

      <MessageThread projectId={project.id} messages={thread} meRole="client" />
      <MarkRead projectId={project.id} />

      {milestones.length > 0 && (
        <section className="rounded-2xl border border-border bg-surface/40 p-7">
          <h2 className="mb-5 text-lg font-semibold">Payment schedule</h2>
          <div className="space-y-2">
            {milestones.map((m) => {
              const ms = MILESTONE_STATUS[m.status];
              return (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 py-2.5 text-sm last:border-0"
                >
                  <span className="flex items-center gap-2">
                    <Badge tone={ms.tone}>{ms.label}</Badge>
                    {m.label}
                  </span>
                  <span className="text-muted">
                    {m.triggerStageIndex === null
                      ? "On request"
                      : `at ${stages[m.triggerStageIndex] ?? "—"}`}
                  </span>
                  <span className="font-medium">{formatCurrency(m.amount)}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold">Updates</h2>
        <div className="space-y-3">
          {updates.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-surface/40 p-4">
              <p className="text-sm">{note.body}</p>
              <p className="mt-2 text-xs text-muted">
                {note.authorName ?? "Coreveb"} · {formatDate(note.createdAt)}
              </p>
            </div>
          ))}
          {updates.length === 0 && (
            <p className="rounded-xl border border-border bg-surface/40 p-4 text-sm text-muted">
              No updates shared yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
