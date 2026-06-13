import { Button, Container, Eyebrow, Section } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SpotlightCard } from "@/components/spotlight-card";
import { managedSupport } from "@/lib/site";

export function ManagedSupport() {
  const { eyebrow, heading, body, features, benefits } = managedSupport;
  return (
    <Section id="managed-it">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* Left: pitch + benefits + CTA */}
          <div className="lg:sticky lg:top-28">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-muted text-pretty">{body}</p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-fg/90">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-soft">
                    <Icon name="shield" className="h-3 w-3" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/contact">Hire our team</Button>
              <Button href="/#services" variant="ghost">
                See all services
              </Button>
            </div>
          </div>

          {/* Right: what's covered */}
          <div className="grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <SpotlightCard
                key={f.title}
                className="group relative rounded-2xl border border-border bg-surface/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-bg text-brand-soft transition-colors group-hover:border-brand/50">
                  <Icon name={f.icon} className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.body}</p>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
