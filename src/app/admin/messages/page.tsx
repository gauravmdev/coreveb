import { requireAdmin } from "@/lib/session";
import { getConversations } from "@/lib/queries";
import { InboxList } from "@/components/app/inbox-list";

export default async function AdminMessages() {
  const user = await requireAdmin();
  const conversations = await getConversations(user);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-muted">Conversations across all client projects.</p>
      </header>
      <InboxList conversations={conversations} basePath="/admin/messages" showCompany />
    </div>
  );
}
