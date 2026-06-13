import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getCompany, getProject, getThreadData } from "@/lib/queries";
import { MessageThread } from "@/components/app/message-thread";
import { MarkRead } from "@/components/app/mark-read";

export default async function AdminConversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  const company = await getCompany(project.companyId);
  const thread = await getThreadData(id, user);

  return (
    <div className="space-y-6">
      <MarkRead projectId={id} />
      <Link href="/admin/messages" className="text-sm text-muted hover:text-fg">
        ← Inbox
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <p className="mt-1 text-sm text-muted">{company?.name}</p>
        </div>
        <Link
          href={`/admin/projects/${id}`}
          className="text-sm text-brand-soft hover:underline"
        >
          Open project →
        </Link>
      </header>
      <MessageThread
        projectId={id}
        messages={thread.messages}
        quotes={thread.quotes}
        invoices={thread.invoices}
        project={project}
        attachables={thread.attachables}
        meRole="admin"
      />
    </div>
  );
}
