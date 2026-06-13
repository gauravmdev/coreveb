"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Icon } from "@/components/icons";

type UserMsg = { role: "user"; text: string };
type BotMsg = {
  role: "bot";
  words: string[];
  shown: number;
  sources: string[];
  sourcesShown: boolean;
};
type Msg = UserMsg | BotMsg;

const SEED_QUESTION = "Which orders are at risk of late delivery today?";

const RESPONSES: { match: RegExp; text: string; sources: string[] }[] = [
  {
    match: /(order|deliver|late|shipment|dispatch|rider)/i,
    text: "7 orders are at risk. The top driver is the East-zone route running 22 min behind — reassigning 2 riders clears 5 of them.",
    sources: ["orders.db", "routing.api", "+2 sources"],
  },
  {
    match: /(revenue|sales|churn|growth|mrr|retention)/i,
    text: "Revenue is up 12% week over week. Churn risk is concentrated in 3 accounts flagged by low activity — worth a proactive nudge.",
    sources: ["analytics.warehouse", "billing.api"],
  },
  {
    match: /(customer|support|ticket|complaint)/i,
    text: "Open tickets are down 18%. The most common theme this week is checkout errors on Android — I grouped 24 related tickets for you.",
    sources: ["zendesk", "events.log"],
  },
  {
    match: /(market|campaign|seo|ad|traffic|lead|conversion)/i,
    text: "Paid is driving the best blended CAC this month, and organic traffic to the pricing page jumped 31% after the last content push.",
    sources: ["ga4", "ads.api", "search.console"],
  },
  {
    match: /(app|mobile|ios|android|crash|build)/i,
    text: "The latest build is stable — crash-free sessions at 99.6%. The order-history screen is slow and a good candidate for caching.",
    sources: ["crashlytics", "perf.traces"],
  },
];

function answerFor(q: string) {
  const hit = RESPONSES.find((r) => r.match.test(q));
  if (hit) return { text: hit.text, sources: hit.sources };
  return {
    text: "Great question. In a live deployment I'd answer that from your own data and tools — Coreveb wires assistants like this into your product, grounded with RAG and checked by evals.",
    sources: ["your-data", "your-tools"],
  };
}

export function ChatDemo() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stream = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduceRef = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (stream.current) clearInterval(stream.current);
  };

  const ask = (question: string) => {
    setBusy(true);
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    const { text, sources } = answerFor(question);
    const words = text.split(" ");

    const begin = () => {
      setMessages((prev) => [
        ...prev,
        { role: "bot", words, shown: 0, sources, sourcesShown: false },
      ]);

      if (reduceRef.current) {
        setMessages((prev) => updateLastBot(prev, words.length, true));
        setBusy(false);
        return;
      }

      let i = 0;
      stream.current = setInterval(() => {
        i += 1;
        setMessages((prev) => updateLastBot(prev, i, false));
        if (i >= words.length) {
          if (stream.current) clearInterval(stream.current);
          timers.current.push(
            setTimeout(() => {
              setMessages((prev) => updateLastBot(prev, words.length, true));
              setBusy(false);
            }, 350),
          );
        }
      }, 95);
    };

    // brief "typing" pause before the answer starts streaming
    timers.current.push(setTimeout(begin, reduceRef.current ? 0 : 650));
  };

  // Auto-play the seed conversation once on mount.
  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    timers.current.push(setTimeout(() => ask(SEED_QUESTION), 500));
    return clearTimers;
  }, []);

  // Keep the latest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    ask(q);
  };

  return (
    <div className="glass flex h-[360px] flex-col rounded-2xl p-4 shadow-glow">
      <div className="flex items-center gap-2 border-b border-white/5 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-pink/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-brand-soft/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
        <span className="ml-2 font-mono text-xs text-muted">coreveb · assistant</span>
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
          demo
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto py-4 text-sm [scrollbar-width:thin]"
      >
        {messages.map((m, idx) => {
          if (m.role === "user") {
            return (
              <div
                key={idx}
                className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-brand/20 px-3.5 py-2 text-fg/90"
              >
                {m.text}
              </div>
            );
          }

          const done = m.shown >= m.words.length;
          const isLast = idx === messages.length - 1;
          return (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <Icon name="ai" className="h-4 w-4" />
              </span>

              {m.shown === 0 ? (
                <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/5 bg-surface/70 px-3.5 py-3">
                  <Dot delay="-0.3s" />
                  <Dot delay="-0.15s" />
                  <Dot delay="0s" />
                </div>
              ) : (
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-white/5 bg-surface/70 px-3.5 py-2 text-fg/90">
                  <p>
                    {m.words.slice(0, m.shown).join(" ")}
                    {isLast && busy && !done && (
                      <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-[1px] bg-accent" />
                    )}
                  </p>
                  {m.sourcesShown && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {m.sources.map((s) => (
                        <span
                          key={s}
                          className="rounded-full border border-border bg-bg/60 px-2 py-0.5 text-[11px] text-muted"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/5 pt-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          aria-label="Ask the demo assistant a question"
          placeholder={busy ? "Thinking…" : "Ask anything…"}
          className="min-w-0 flex-1 rounded-xl border border-border bg-bg/60 px-3.5 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/70 focus:border-brand/60 disabled:opacity-60"
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

function updateLastBot(prev: Msg[], shown: number, sourcesShown: boolean): Msg[] {
  const next = [...prev];
  for (let i = next.length - 1; i >= 0; i--) {
    const m = next[i];
    if (m.role === "bot") {
      next[i] = { ...m, shown, sourcesShown };
      break;
    }
  }
  return next;
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}
