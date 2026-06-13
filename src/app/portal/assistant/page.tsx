import { PageHeader } from "@/components/app/ui";
import { Assistant } from "@/components/app/assistant";

export default function PortalAssistant() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Help"
        description="Ask anything about how your projects, quotes, billing, and messages work."
      />
      <Assistant audience="client" />
    </div>
  );
}
