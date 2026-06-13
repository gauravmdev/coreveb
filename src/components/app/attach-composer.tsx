"use client";

import { useState } from "react";
import { postProjectMessage } from "@/app/message-actions";

const cls =
  "rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-brand/60";

export function AttachComposer({
  projectId,
  attachables,
}: {
  projectId: string;
  attachables: {
    quotes: { id: string; number: string; title: string }[];
    invoices: { id: string; number: string; amount: number }[];
  };
}) {
  const [type, setType] = useState("");

  return (
    <form
      action={postProjectMessage}
      className="mt-4 space-y-3 border-t border-border pt-4"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <textarea
        name="body"
        rows={2}
        placeholder="Write a message…"
        className="w-full resize-none rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none placeholder:text-muted/70 focus:border-brand/60"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="attachmentType"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={cls}
        >
          <option value="">No attachment</option>
          <option value="quote">📄 Attach quote</option>
          <option value="invoice">🧾 Attach invoice</option>
          <option value="approval">✓ Request sign-off</option>
        </select>

        {type === "quote" && (
          <select name="attachmentId" defaultValue="" required className={cls}>
            <option value="" disabled>
              Select quote…
            </option>
            {attachables.quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.number} — {q.title}
              </option>
            ))}
          </select>
        )}
        {type === "invoice" && (
          <select name="attachmentId" defaultValue="" required className={cls}>
            <option value="" disabled>
              Select invoice…
            </option>
            {attachables.invoices.map((i) => (
              <option key={i.id} value={i.id}>
                {i.number}
              </option>
            ))}
          </select>
        )}
        {type === "approval" && (
          <span className="text-xs text-muted">
            Asks the client to approve the project&apos;s current stage.
          </span>
        )}

        <button
          type="submit"
          className="sheen ml-auto rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-soft"
        >
          Send
        </button>
      </div>
    </form>
  );
}
