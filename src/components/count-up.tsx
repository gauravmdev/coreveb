"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animates a numeric value up from 0 when it scrolls into view.
 * Accepts display strings like "120+", "98%", "10×" — it animates the
 * leading number and keeps the suffix.
 */
export function CountUp({ value }: { value: string }) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const decimals = match?.[1].includes(".") ? match[1].split(".")[1].length : 0;

  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || ran.current) continue;
          ran.current = true;

          if (reduce) {
            setN(target);
            return;
          }

          const duration = 1200;
          let start: number | undefined;
          const tick = (t: number) => {
            if (start === undefined) start = t;
            const p = Math.min(1, (t - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setN(target * eased);
            if (p < 1) requestAnimationFrame(tick);
            else setN(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const display = decimals ? n.toFixed(decimals) : Math.round(n).toString();
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
