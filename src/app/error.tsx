"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in server logs; swap for a real error tracker (e.g. Sentry) later.
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="theme-dark grid min-h-screen place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-sm tracking-widest text-accent">Error</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">
          An unexpected error occurred. You can try again, or head back and retry.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted/70">Ref: {error.digest}</p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
          >
            Back home
          </Link>
        </div>
      </div>
    </main>
  );
}
