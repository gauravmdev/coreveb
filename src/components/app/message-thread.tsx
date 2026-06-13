import { postProjectMessage } from "@/app/message-actions";
import type { Message } from "@/db/schema";

function fmt(d: Date | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
}

export function MessageThread({
  projectId,
  messages,
  meRole,
}: {
  projectId: string;
  messages: Message[];
  meRole: "client" | "admin";
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-4 text-lg font-semibold">Messages</h2>

      <div className="max-h-[440px] space-y-3 overflow-y-auto pr-1">
        {messages.map((m) => {
          const mine = m.authorRole === meRole;
          return (
            <div
              key={m.id}
              className={`flex flex-col ${mine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "rounded-br-sm bg-brand/20 text-fg"
                    : "rounded-bl-sm border border-border bg-bg/60 text-fg/90"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
              <span className="mt-1 px-1 text-[11px] text-muted">
                {m.authorName} ·{" "}
                {m.authorRole === "admin" ? "Coreveb" : "Client"} ·{" "}
                {fmt(m.createdAt)}
              </span>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="py-4 text-sm text-muted">
            No messages yet — start the conversation below.
          </p>
        )}
      </div>

      <form
        action={postProjectMessage}
        className="mt-4 flex items-end gap-2 border-t border-border pt-4"
      >
        <input type="hidden" name="projectId" value={projectId} />
        <textarea
          name="body"
          required
          rows={2}
          placeholder="Write a message…"
          className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-brand/60"
        />
        <button
          type="submit"
          className="sheen shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-soft"
        >
          Send
        </button>
      </form>
    </section>
  );
}
