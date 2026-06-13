import { requireUser } from "@/lib/session";
import { getConversations } from "@/lib/queries";
import { InboxList } from "@/components/app/inbox-list";
import { PageHeader } from "@/components/app/ui";

export default async function PortalMessages() {
  const user = await requireUser();
  const conversations = user.companyId ? await getConversations(user) : [];

  return (
    <div className="space-y-8">
      <PageHeader title="Messages" description="Your conversations with the Coreveb team." />
      <InboxList
        conversations={conversations}
        basePath="/portal/messages"
        showCompany={false}
      />
    </div>
  );
}
