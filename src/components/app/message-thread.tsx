import Link from "next/link";
import { postProjectMessage } from "@/app/message-actions";
import {
  acceptQuotation,
  approveStage,
  declineQuotation,
  requestStageChanges,
} from "@/app/portal/actions";
import { Badge } from "@/components/app/badge";
import { AttachComposer } from "@/components/app/attach-composer";
import {
  INVOICE_STATUS,
  QUOTE_STATUS,
  formatCurrency,
  stagesFor,
  type ProjectType,
} from "@/lib/crm";
import type { Message, Project } from "@/db/schema";
import type { InvoiceCard, QuoteCard } from "@/lib/queries";

function fmt(d: Date | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(d));
}

type Attachables = {
  quotes: { id: string; number: string; title: string }[];
  invoices: { id: string; number: string; amount: number }[];
};

export function MessageThread({
  projectId,
  messages,
  meRole,
  quotes = {},
  invoices = {},
  project,
  attachables,
}: {
  projectId: string;
  messages: Message[];
  meRole: "client" | "admin";
  quotes?: Record<string, QuoteCard>;
  invoices?: Record<string, InvoiceCard>;
  project?: Pick<Project, "type" | "stageIndex" | "awaitingApproval"> | null;
  attachables?: Attachables | null;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface/40 p-6">
      <h2 className="mb-4 text-lg font-semibold">Messages</h2>

      <div className="max-h-[460px] space-y-4 overflow-y-auto pr-1">
        {messages.map((m) => {
          const mine = m.authorRole === meRole;
          return (
            <div
              key={m.id}
              className={`flex flex-col gap-2 ${mine ? "items-end" : "items-start"}`}
            >
              {m.body && (
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                    mine
                      ? "rounded-br-sm bg-brand/20 text-fg"
                      : "rounded-bl-sm border border-border bg-bg/60 text-fg/90"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.body}</p>
                </div>
              )}

              {m.attachmentType && (
                <Attachment
                  message={m}
                  meRole={meRole}
                  quotes={quotes}
                  invoices={invoices}
                  project={project}
                />
              )}

              <span className="px-1 text-[11px] text-muted">
                {m.authorName} · {m.authorRole === "admin" ? "Coreveb" : "Client"}{" "}
                · {fmt(m.createdAt)}
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

      {attachables ? (
        <AttachComposer projectId={projectId} attachables={attachables} />
      ) : (
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
            className="min-w-0 flex-1 resize-none rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none placeholder:text-muted/70 focus:border-brand/60"
          />
          <button
            type="submit"
            className="sheen shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-soft"
          >
            Send
          </button>
        </form>
      )}
    </section>
  );
}

function Attachment({
  message,
  meRole,
  quotes,
  invoices,
  project,
}: {
  message: Message;
  meRole: "client" | "admin";
  quotes: Record<string, QuoteCard>;
  invoices: Record<string, InvoiceCard>;
  project?: Pick<Project, "type" | "stageIndex" | "awaitingApproval"> | null;
}) {
  const cardCls =
    "w-full max-w-md rounded-xl border border-brand/30 bg-bg/60 p-4";

  if (message.attachmentType === "quote") {
    const q = message.attachmentId ? quotes[message.attachmentId] : undefined;
    if (!q) return null;
    const tone = QUOTE_STATUS[q.status as keyof typeof QUOTE_STATUS]?.tone ?? "muted";
    return (
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">{q.number}</span>
          <Badge tone={tone}>{q.status}</Badge>
        </div>
        <div className="mt-1 font-medium">{q.title}</div>
        <div className="mt-1 text-lg font-semibold">
          {formatCurrency(q.total, q.currency)}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Link
            href={`/proposals/${q.id}`}
            target="_blank"
            className="rounded-lg border border-border px-3 py-1.5 text-xs hover:border-brand/50"
          >
            View proposal →
          </Link>
          {meRole === "client" && q.status === "sent" && (
            <>
              <form action={acceptQuotation}>
                <input type="hidden" name="quotationId" value={q.id} />
                <button
                  type="submit"
                  className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-soft"
                >
                  Accept quote
                </button>
              </form>
              <form action={declineQuotation}>
                <input type="hidden" name="quotationId" value={q.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-red-500/40 hover:text-red-300"
                >
                  Decline
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  if (message.attachmentType === "invoice") {
    const inv = message.attachmentId ? invoices[message.attachmentId] : undefined;
    if (!inv) return null;
    const tone = INVOICE_STATUS[inv.status as keyof typeof INVOICE_STATUS]?.tone ?? "muted";
    return (
      <div className={cardCls}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted">{inv.number}</span>
          <Badge tone={tone}>{inv.status}</Badge>
        </div>
        <div className="mt-1 text-lg font-semibold">{formatCurrency(inv.amount)}</div>
        <Link
          href={meRole === "admin" ? "/admin/invoices" : "/portal/invoices"}
          className="mt-3 inline-block rounded-lg border border-border px-3 py-1.5 text-xs hover:border-brand/50"
        >
          View invoices →
        </Link>
      </div>
    );
  }

  if (message.attachmentType === "approval" && project) {
    const stage = stagesFor(project.type as ProjectType)[project.stageIndex] ?? "current";
    const pending = project.awaitingApproval;
    return (
      <div className={cardCls}>
        <p className="text-sm">
          <span className="font-semibold">Sign-off requested</span> on the{" "}
          <span className="text-brand-soft">{stage}</span> stage.
        </p>
        {meRole === "client" && pending ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <form action={approveStage}>
              <input type="hidden" name="projectId" value={message.projectId} />
              <button
                type="submit"
                className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-soft"
              >
                Approve &amp; continue
              </button>
            </form>
            <form action={requestStageChanges}>
              <input type="hidden" name="projectId" value={message.projectId} />
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-amber-500/40 hover:text-amber-300"
              >
                Request changes
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">
            {pending ? "Awaiting client sign-off." : "Resolved."}
          </p>
        )}
      </div>
    );
  }

  return null;
}
