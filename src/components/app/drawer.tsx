"use client";

import { useState, type ReactNode } from "react";

export function Drawer({
  label,
  title,
  description,
  children,
}: {
  label: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-soft"
      >
        <span className="text-base leading-none">+</span>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-bg-soft shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && (
                  <p className="mt-0.5 text-sm text-muted">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-fg"
              >
                ✕
              </button>
            </header>

            {/* Submit bubbles up here → close the drawer after a valid submit. */}
            <div
              className="flex-1 overflow-y-auto p-6"
              onSubmit={() => setTimeout(() => setOpen(false), 50)}
            >
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
