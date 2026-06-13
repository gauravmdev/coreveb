import { Button, Container, Eyebrow, Section } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SpotlightCard } from "@/components/spotlight-card";
import { costComparison, itServices, managedSupport } from "@/lib/site";

export function ManagedSupport() {
  const { eyebrow, heading, body, features, benefits } = managedSupport;
  const { inHouse, coreveb, headline, note } = costComparison;

  return (
    <Section id="managed-it">
      <Container>
        {/* Header */}
        <div className="max-w-2xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 text-muted text-pretty">{body}</p>
        </div>

        {/* Cost comparison */}
        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-2">
          {/* In-house */}
          <div className="relative rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-7">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{inHouse.label}</h3>
                <p className="mt-0.5 text-xs text-muted">{inHouse.sub}</p>
              </div>
              <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-red-300">
                Expensive
              </span>
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              {inHouse.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{r.label}</dt>
                  <dd className="font-medium tabular-nums">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
              <span className="text-sm text-muted">{inHouse.totalNote}</span>
              <span className="text-xl font-semibold text-red-300">{inHouse.total}</span>
            </div>
          </div>

          {/* Coreveb */}
          <div className="relative rounded-2xl border border-brand/40 bg-brand/[0.06] p-7 shadow-glow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{coreveb.label}</h3>
                <p className="mt-0.5 text-xs text-muted">{coreveb.sub}</p>
              </div>
              <span className="rounded-full bg-brand/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-soft">
                Best value
              </span>
            </div>
            <dl className="mt-5 space-y-2.5 text-sm">
              {coreveb.rows.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4">
                  <dt className="text-muted">{r.label}</dt>
                  <dd className="inline-flex items-center gap-1.5 font-medium text-fg/90">
                    <Icon name="shield" className="h-3.5 w-3.5 text-brand-soft" />
                    {r.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-border/60 pt-4">
              <span className="text-sm text-muted">{coreveb.totalNote}</span>
              <span className="text-xl font-semibold text-brand-soft">{coreveb.total}</span>
            </div>
          </div>
        </div>

        <p className="mt-5 text-center text-base font-medium text-fg/90">{headline}</p>
        <p className="mt-1 text-center text-xs text-muted">{note}</p>

        {/* Benefits */}
        <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2">
          {benefits.map((b) => (
            <li key={b} className="inline-flex items-center gap-2 text-sm text-fg/90">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-soft">
                <Icon name="shield" className="h-3 w-3" />
              </span>
              {b}
            </li>
          ))}
        </ul>

        {/* Core expertise */}
        <h3 className="mt-16 text-xs font-semibold uppercase tracking-widest text-muted">
          Core expertise
        </h3>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <SpotlightCard
              key={f.title}
              className="group relative rounded-2xl border border-border bg-surface/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-bg text-brand-soft transition-colors group-hover:border-brand/50">
                <Icon name={f.icon} className="h-5 w-5" />
              </div>
              <h4 className="mt-4 text-base font-semibold">{f.title}</h4>
              <p className="mt-2 text-sm text-muted">{f.body}</p>
            </SpotlightCard>
          ))}
        </div>

        {/* Full catalog */}
        <h3 className="mt-14 text-xs font-semibold uppercase tracking-widest text-muted">
          Plus everything else we handle
        </h3>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {itServices.map((s) => (
            <span
              key={s}
              className="rounded-full border border-border bg-surface/40 px-3.5 py-1.5 text-sm text-fg/85 transition-colors hover:border-brand/50 hover:text-fg"
            >
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-wrap items-center gap-3">
          <Button href="/contact">Hire our team</Button>
          <Button href="/#services" variant="ghost">
            See all services
          </Button>
        </div>
      </Container>
    </Section>
  );
}
