import { Container } from "@/components/ui";
import { Icon } from "@/components/icons";
import { partners } from "@/lib/site";

export function Partners() {
  return (
    <Container>
      <div className="reveal">
        <p className="text-center text-xs uppercase tracking-widest text-muted">
          Official partner of
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {partners.map((name) => (
            <div
              key={name}
              className="group flex items-center gap-2.5 rounded-xl border border-border bg-surface/40 px-5 py-3 transition-colors hover:border-brand/50"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-brand/15 text-brand-soft">
                <Icon name="shield" className="h-3.5 w-3.5" />
              </span>
              <span className="text-base font-semibold tracking-tight">{name}</span>
              <span className="text-xs text-muted">Partner</span>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
