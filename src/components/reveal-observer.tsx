"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Reveals elements with the `.reveal` class as they scroll into view.
 * One IntersectionObserver for the whole page; re-scans on route change.
 * Works in every browser (unlike CSS scroll-driven animations).
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));

    if (reduce) {
      els.forEach((el) => el.classList.add("in-view"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );

    els.forEach((el) => {
      // Already in view on load (e.g. above the fold) — reveal immediately.
      if (el.getBoundingClientRect().top < window.innerHeight) {
        el.classList.add("in-view");
      } else {
        io.observe(el);
      }
    });

    return () => io.disconnect();
  }, [pathname]);

  return null;
}
