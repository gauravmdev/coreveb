"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icons";

/** In-shell error UI for admin/portal segments — keeps the sidebar intact. */
export function ErrorState({
  error,
  reset,
  area,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  area: string;
}) {
  useEffect(() => {
    console.error(`[${area} error]`, error);
  }, [error, area]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
          <Icon name="shield" className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-xl font-semibold tracking-tight">
          Couldn’t load this page
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Something went wrong fetching your {area} data. Please try again.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-muted/70">Ref: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
