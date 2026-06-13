import { Container } from "@/components/ui";
import { SpotlightCard } from "@/components/spotlight-card";
import { CountUp } from "@/components/count-up";
import { stats } from "@/lib/site";

export function Stats() {
  return (
    <Container>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <SpotlightCard
            key={s.label}
            className="glass rounded-2xl px-6 py-7 text-center transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              <CountUp value={s.value} />
            </div>
            <div className="mt-2 text-sm text-muted">{s.label}</div>
          </SpotlightCard>
        ))}
      </div>
    </Container>
  );
}
