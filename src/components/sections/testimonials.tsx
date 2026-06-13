import { Container, Eyebrow, Section } from "@/components/ui";
import { testimonials } from "@/lib/site";

export function Testimonials() {
  return (
    <Section className="bg-bg-soft">
      <Container>
        <Eyebrow>What clients say</Eyebrow>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="rounded-2xl border border-border bg-surface/40 p-8"
            >
              <blockquote className="text-lg leading-relaxed text-fg/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand/20 text-sm font-semibold text-brand-soft">
                  {t.name.charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-medium">{t.name}</span>
                  <span className="block text-sm text-muted">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
