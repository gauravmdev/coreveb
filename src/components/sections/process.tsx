import { Container, Eyebrow, Section } from "@/components/ui";
import { processSteps } from "@/lib/site";

export function Process() {
  return (
    <Section id="process" className="bg-bg-soft">
      <Container>
        <div className="max-w-2xl">
          <Eyebrow>How we work</Eyebrow>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
            A process built for momentum
          </h2>
          <p className="mt-4 text-muted">
            Short loops, visible progress, and no surprises. You see working
            software every two weeks and always know what&apos;s next.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((p) => (
            <div
              key={p.step}
              className="relative rounded-2xl border border-border bg-surface/40 p-6"
            >
              <span className="font-mono text-sm text-brand-soft">{p.step}</span>
              <h3 className="mt-3 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
