import { Container, Eyebrow, Section } from "@/components/ui";
import { Icon } from "@/components/icons";
import { SpotlightCard } from "@/components/spotlight-card";
import { ChatDemo } from "@/components/sections/chat-demo";
import { aiCapabilities } from "@/lib/site";

export function AICapabilities() {
  return (
    <Section id="ai" className="bg-bg-soft">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow>AI capabilities</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Intelligence, built into your product
            </h2>
            <p className="mt-4 max-w-md text-muted">
              We go past the demo. Coreveb ships production AI — grounded in your
              data, wired into your tools, and measured with real evals — so it
              earns trust instead of just looking impressive.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {["Provider-agnostic", "Your data stays yours", "Evals + guardrails"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs text-fg/80"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>

          <ChatDemo />
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {aiCapabilities.map((c) => (
            <SpotlightCard
              key={c.title}
              className="group rounded-2xl border border-border bg-surface/40 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/50"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-bg text-brand-soft transition-colors group-hover:border-brand/50 group-hover:text-accent">
                <Icon name={c.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted">{c.body}</p>
            </SpotlightCard>
          ))}
        </div>
      </Container>
    </Section>
  );
}
