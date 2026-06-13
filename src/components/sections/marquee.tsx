import { Container } from "@/components/ui";
import { techStack } from "@/lib/site";

export function TechMarquee() {
  const items = [...techStack, ...techStack];
  return (
    <Container>
      <p className="text-center text-xs uppercase tracking-widest text-muted">
        The modern, AI-first stack we build on
      </p>
      <div className="marquee-mask mt-6 overflow-hidden">
        <div className="marquee gap-3">
          {items.map((t, i) => (
            <span
              key={`${t}-${i}`}
              className="whitespace-nowrap rounded-full border border-border bg-surface/40 px-5 py-2 text-sm text-fg/80"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </Container>
  );
}
