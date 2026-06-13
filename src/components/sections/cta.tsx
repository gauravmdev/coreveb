import { Button, Container, Section } from "@/components/ui";

export function CTA() {
  return (
    <Section>
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface/40 px-8 py-16 text-center sm:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand/25 blur-[120px]" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Have an idea worth building?
            </h2>
            <p className="mt-4 text-muted">
              Tell us what you&apos;re working on. We&apos;ll come back within one
              business day with how we&apos;d approach it.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/contact">Start a project</Button>
              <Button href="mailto:hello@coreveb.com" variant="ghost">
                Email us
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
