import type { ReactNode } from "react";

/**
 * Lightweight prose renderer for proposal section bodies.
 * - `## ` → subheading
 * - `- ` or `✓ ` → bullet
 * - blank line → paragraph break
 */
export function Prose({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={key++} className="leading-relaxed text-slate-600">
          {para.join(" ")}
        </p>,
      );
      para = [];
    }
  };
  const flushBullets = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={key++} className="space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2.5 text-slate-600">
              <span className="mt-1 text-teal-600">✓</span>
              <span className="leading-relaxed">{b}</span>
            </li>
          ))}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushBullets();
    } else if (line.startsWith("## ")) {
      flushPara();
      flushBullets();
      blocks.push(
        <h3 key={key++} className="text-base font-semibold text-teal-800">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("- ") || line.startsWith("✓ ")) {
      flushPara();
      bullets.push(line.slice(2));
    } else {
      flushBullets();
      para.push(line);
    }
  }
  flushPara();
  flushBullets();

  return <div className="space-y-4">{blocks}</div>;
}
