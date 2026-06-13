import Link from "next/link";
import type { Message } from "@/db/schema";

type Conversation = {
  projectId: string;
  projectName: string | null;
  companyName: string | null;
  last: Message;
  unread: number;
};

function relTime(d: Date | number) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(d),
  );
}

export function InboxList({
  conversations,
  basePath,
  showCompany,
}: {
  conversations: Conversation[];
  basePath: string;
  showCompany: boolean;
}) {
  if (conversations.length === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface/40 p-6 text-sm text-muted">
        No conversations yet.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      {conversations.map((c) => (
        <Link
          key={c.projectId}
          href={`${basePath}/${c.projectId}`}
          className="flex items-center gap-4 border-b border-border/60 px-5 py-4 transition-colors last:border-0 hover:bg-surface/50"
        >
          <span
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold ${
              c.unread > 0
                ? "bg-brand/20 text-brand-soft"
                : "bg-surface text-muted"
            }`}
          >
            {(c.last.authorName ?? "?").charAt(0).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`truncate ${c.unread > 0 ? "font-semibold" : "font-medium"}`}>
                {c.projectName ?? "Project"}
              </span>
              {showCompany && c.companyName && (
                <span className="shrink-0 text-xs text-muted">· {c.companyName}</span>
              )}
            </div>
            <p className={`truncate text-sm ${c.unread > 0 ? "text-fg/90" : "text-muted"}`}>
              <span className="text-muted">
                {c.last.authorRole === "admin" ? "Coreveb" : c.last.authorName}:
              </span>{" "}
              {c.last.body}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-xs text-muted">{relTime(c.last.createdAt)}</span>
            {c.unread > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-semibold text-white">
                {c.unread}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
