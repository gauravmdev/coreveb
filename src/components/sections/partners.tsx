import { Container } from "@/components/ui";

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#4285F4", "#34A853", "#EA4335"];

const wordmarkCls =
  "text-2xl font-semibold tracking-tight transition-transform duration-300 hover:scale-105 sm:text-[28px]";

function GoogleWordmark() {
  return (
    <span className={wordmarkCls} aria-label="Google">
      {"Google".split("").map((ch, i) => (
        <span key={i} style={{ color: GOOGLE_COLORS[i] }} aria-hidden>
          {ch}
        </span>
      ))}
    </span>
  );
}

export function Partners() {
  return (
    <Container>
      <div className="reveal">
        <p className="text-center text-xs uppercase tracking-widest text-muted">
          Technologies &amp; platforms we work with
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
          <span className={wordmarkCls} style={{ color: "#0866FF" }}>
            Meta
          </span>
          <span className={wordmarkCls} style={{ color: "#673DE6" }}>
            Hostinger
          </span>
          <GoogleWordmark />
        </div>
      </div>
    </Container>
  );
}
