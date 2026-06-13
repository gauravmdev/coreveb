import { Container, Eyebrow, Section } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SpotlightCard } from "@/components/spotlight-card";
import { services } from "@/lib/site";

export function Services() {
  return (
    <Section id="services">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>What we do</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            Four disciplines, one team
          </h2>
          <p className="mt-4 text-muted">
            Modern products need AI, engineering, design, and marketing moving
            together. We keep all of it in the same room so nothing gets lost in
            the handoff.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const featured = i === 0;
            const inner = (
              <>
                {featured && (
                  <span className="absolute right-5 top-5 rounded-full bg-brand/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-brand-soft">
                    New
                  </span>
                )}
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-bg text-brand-soft transition-colors group-hover:border-brand/50">
                  <Icon name={s.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
                <p className="mt-3 text-sm text-muted">{s.blurb}</p>
                <ul className="mt-5 space-y-2">
                  {s.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-fg/90">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {p}
                    </li>
                  ))}
                </ul>
              </>
            );

            if (featured) {
              return (
                <div
                  key={s.title}
                  className="group gradient-border glass relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                >
                  {inner}
                </div>
              );
            }

            return (
              <SpotlightCard
                key={s.title}
                className="group relative rounded-2xl border border-border bg-surface/40 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50"
              >
                {inner}
              </SpotlightCard>
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
