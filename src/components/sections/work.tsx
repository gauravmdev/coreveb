import Link from "next/link";
import { Container, Eyebrow, Section } from "@/components/ui";
import { SpotlightCard } from "@/components/spotlight-card";
import { work } from "@/lib/site";

export function Work() {
  return (
    <Section id="work">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <Eyebrow>Selected work</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Products people rely on
            </h2>
          </div>
          <p className="max-w-xs text-sm text-muted">
            A few of the platforms, apps, and campaigns we&apos;ve shipped end to
            end.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {work.map((w) => (
            <SpotlightCard
              key={w.title}
              className="group relative overflow-hidden rounded-2xl border border-border bg-surface/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-muted">
                  {w.category}
                </span>
                <span className="rounded-full border border-border px-2.5 py-1 text-xs text-brand-soft">
                  {w.tag}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold">{w.title}</h3>
              <p className="mt-2 text-sm text-muted">{w.blurb}</p>
              <Link
                href="/contact"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-brand-soft transition-opacity hover:underline sm:opacity-0 sm:group-hover:opacity-100"
              >
                Start a similar project →
              </Link>
            </SpotlightCard>
          ))}
        </div>
      </Container>
    </Section>
  );
}
