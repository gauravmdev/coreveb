import { requireUser } from "@/lib/session";
import { getConversations } from "@/lib/queries";
import { InboxList } from "@/components/app/inbox-list";

export default async function PortalMessages() {
  const user = await requireUser();
  const conversations = user.companyId ? await getConversations(user) : [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-muted">Your conversations with the Coreveb team.</p>
      </header>
      <InboxList
        conversations={conversations}
        basePath="/portal/messages"
        showCompany={false}
      />
    </div>
  );
}
