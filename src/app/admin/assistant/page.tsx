import { PageHeader } from "@/components/app/ui";
import { Assistant } from "@/components/app/assistant";

export default function AdminAssistant() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Help"
        description="Ask how the CRM, quotations, milestone billing, proposals, and messaging work."
      />
      <Assistant audience="admin" />
    </div>
  );
}
