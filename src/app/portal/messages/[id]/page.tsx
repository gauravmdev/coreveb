import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getProject, getProjectMessages } from "@/lib/queries";
import { MessageThread } from "@/components/app/message-thread";
import { MarkRead } from "@/components/app/mark-read";

export default async function PortalConversation({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const project = await getProject(id);
  if (!project || project.companyId !== user.companyId) notFound();
  const thread = await getProjectMessages(id);

  return (
    <div className="space-y-6">
      <MarkRead projectId={id} />
      <Link href="/portal/messages" className="text-sm text-muted hover:text-fg">
        ← Inbox
      </Link>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
        <Link
          href={`/portal/projects/${id}`}
          className="text-sm text-brand-soft hover:underline"
        >
          Open project →
        </Link>
      </header>
      <MessageThread projectId={id} messages={thread} meRole="client" />
    </div>
  );
}
