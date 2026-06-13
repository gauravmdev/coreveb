import { Button, Container } from "@/components/ui";
import { site } from "@/lib/site";

const chips = ["AI agents", "RAG search", "Automation", "Evals & guardrails"];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="rays" aria-hidden />
      <div className="aurora" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="noise pointer-events-none absolute inset-0" aria-hidden />

      <Container className="relative py-28 sm:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-surface/50 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-muted backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            AI-native product studio
          </div>

          <h1 className="mt-7 text-5xl font-semibold leading-[1.03] tracking-tight text-balance sm:text-6xl">
            <span className="text-gradient drop-shadow-[0_0_40px_rgba(124,92,255,0.35)]">
              AI-native products,
            </span>
            <br />
            shipped end to end.
          </h1>

          <p className="mx-auto mt-7 max-w-xl text-lg text-muted text-pretty">
            {site.description}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href="/contact">Start a project</Button>
            <Button href="/#work" variant="ghost">
              See our work
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {chips.map((c) => (
              <span
                key={c}
                className="rounded-full border border-border bg-bg/40 px-3 py-1.5 font-mono text-xs text-muted backdrop-blur"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </Container>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-bg" />
    </section>
  );
}
