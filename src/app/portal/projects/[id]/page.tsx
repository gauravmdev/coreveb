import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getProject, getProjectNotes } from "@/lib/queries";
import { Badge } from "@/components/app/badge";
import { StageTimeline } from "@/components/app/stage-timeline";
import {
  PROJECT_STATUS,
  PROJECT_TYPE_LABEL,
  formatDate,
  type ProjectType,
} from "@/lib/crm";

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const project = getProject(id);

  // Authorization: clients can only view their own company's projects.
  if (!project || project.companyId !== user.companyId) notFound();

  const status = PROJECT_STATUS[project.status];
  const updates = getProjectNotes(project.id, true);

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
      </section>

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
