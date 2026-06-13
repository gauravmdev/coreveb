"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import {
  search,
  getEntry,
  STARTERS,
  NO_MATCH,
  type Audience,
  type KbEntry,
} from "@/lib/assistant";

type UserMsg = { role: "user"; text: string };
type BotMsg = {
  role: "bot";
  answer: string;
  /** ids of follow-up / related questions shown as chips */
  followups: { id: string; question: string }[];
};
type Msg = UserMsg | (BotMsg & { pending?: boolean });

function buildAnswer(query: string, audience: Audience): BotMsg {
  const matches = search(query, audience);
  if (matches.length === 0) {
    return { role: "bot", answer: NO_MATCH, followups: [] };
  }
  const best = matches[0].entry;
  const followups: { id: string; question: string }[] = [];
  const seen = new Set<string>([best.id]);

  // Related entries first, then other strong matches as alternatives.
  for (const rid of best.related ?? []) {
    const e = getEntry(rid, audience);
    if (e && !seen.has(e.id)) {
      followups.push({ id: e.id, question: e.question });
      seen.add(e.id);
    }
  }
  for (const m of matches.slice(1)) {
    if (!seen.has(m.entry.id)) {
      followups.push({ id: m.entry.id, question: m.entry.question });
      seen.add(m.entry.id);
    }
  }
  return { role: "bot", answer: best.answer, followups: followups.slice(0, 3) };
}

/** Render answer text: blank-line paragraphs, "- " lines become bullets. */
function AnswerBody({ text }: { text: string }) {
  const blocks = text.split("\n\n");
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => l.trim().startsWith("- "));
        if (isList) {
          return (
            <ul key={i} className="space-y-1">
              {lines.map((l, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-soft" />
                  <span>{l.replace(/^\s*-\s/, "")}</span>
                </li>
              ))}
            </ul>
          );
        }
        // mixed block: render lead line + any bullets after it
        return (
          <div key={i} className="space-y-1">
            {lines.map((l, j) =>
              l.trim().startsWith("- ") ? (
                <div key={j} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-soft" />
                  <span>{l.replace(/^\s*-\s/, "")}</span>
                </div>
              ) : (
                <p key={j}>{l}</p>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Assistant({ audience }: { audience: Audience }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceRef = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  function ask(question: string) {
    if (busy) return;
    setBusy(true);
    const bot = buildAnswer(question, audience);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: question },
      { ...bot, pending: true },
    ]);

    const reveal = () => {
      setMessages((prev) => {
        const next = [...prev];
        for (let i = next.length - 1; i >= 0; i--) {
          const m = next[i];
          if (m.role === "bot") {
            next[i] = { ...m, pending: false };
            break;
          }
        }
        return next;
      });
      setBusy(false);
    };

    timer.current = setTimeout(reveal, reduceRef.current ? 0 : 480);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    ask(q);
  }

  const empty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-9.5rem)] min-h-[420px] flex-col rounded-2xl border border-border bg-surface/40 shadow-sm">
      {/* Conversation */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6 [scrollbar-width:thin]">
        {empty && (
          <div className="mx-auto max-w-lg py-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand-soft">
              <Icon name="spark" className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">Ask me about Coreveb</h2>
            <p className="mt-1.5 text-sm text-muted">
              I can explain how stages, quotations, milestone billing, invoices, and
              messaging work. Pick a question or type your own.
            </p>
          </div>
        )}

        {messages.map((m, idx) => {
          if (m.role === "user") {
            return (
              <div
                key={idx}
                className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-brand/20 px-3.5 py-2 text-sm text-fg"
              >
                {m.text}
              </div>
            );
          }
          return (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <Icon name="ai" className="h-4 w-4" />
              </span>
              <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-border bg-bg/60 px-4 py-3 text-sm text-fg">
                {m.pending ? (
                  <div className="flex items-center gap-1.5 py-0.5">
                    <Dot delay="-0.3s" />
                    <Dot delay="-0.15s" />
                    <Dot delay="0s" />
                  </div>
                ) : (
                  <>
                    <AnswerBody text={m.answer} />
                    {m.followups.length > 0 && (
                      <div className="mt-3 border-t border-border/60 pt-3">
                        <div className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                          Related
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {m.followups.map((f) => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => ask(f.question)}
                              className="rounded-full border border-border bg-surface px-2.5 py-1 text-left text-xs text-muted transition-colors hover:border-brand/50 hover:text-fg"
                            >
                              {f.question}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {/* Starter chips (only before first question) */}
        {empty && (
          <div className="mx-auto flex max-w-lg flex-wrap justify-center gap-2 pt-2">
            {STARTERS[audience].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => ask(q)}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-brand/50 hover:text-fg"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border/60 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          aria-label="Ask the assistant a question"
          placeholder={busy ? "Thinking…" : "Ask how something works…"}
          className="min-w-0 flex-1 rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition-all hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="send" className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}

export type { KbEntry };
