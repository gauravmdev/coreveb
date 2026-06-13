import { requireAdmin } from "@/lib/session";
import { getConversations } from "@/lib/queries";
import { InboxList } from "@/components/app/inbox-list";
import { PageHeader } from "@/components/app/ui";

export default async function AdminMessages() {
  const user = await requireAdmin();
  const conversations = await getConversations(user);

  return (
    <div className="space-y-8">
      <PageHeader title="Messages" description="Conversations across all client projects." />
      <InboxList conversations={conversations} basePath="/admin/messages" showCompany />
    </div>
  );
}
