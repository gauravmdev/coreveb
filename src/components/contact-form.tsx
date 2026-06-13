"use client";

import { useState, type FormEvent } from "react";

const services = ["Software", "Mobile App", "Digital Marketing", "Not sure yet"];
const budgets = ["< $10k", "$10k–$30k", "$30k–$75k", "$75k+"];

type Status = "idle" | "submitting" | "success" | "error";

const fieldClass =
  "w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-fg placeholder:text-muted/70 outline-none transition-colors focus:border-brand/60 focus:ring-2 focus:ring-brand/20";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start justify-center rounded-2xl border border-border bg-surface/40 p-10">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-accent/15 text-2xl text-accent">
          ✓
        </span>
        <h2 className="mt-5 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2 text-muted">
          Thanks for reaching out — we&apos;ll get back to you within one
          business day.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm font-medium text-brand-soft hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-surface/40 p-7 sm:p-8"
      noValidate
    >
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Name" htmlFor="name">
            <input id="name" name="name" required className={fieldClass} placeholder="Jane Doe" />
          </Field>
          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              required
              className={fieldClass}
              placeholder="jane@company.com"
            />
          </Field>
        </div>

        <Field label="Company" htmlFor="company" optional>
          <input id="company" name="company" className={fieldClass} placeholder="Company Inc." />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="What do you need?" htmlFor="service">
            <select id="service" name="service" className={fieldClass} defaultValue={services[0]}>
              {services.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Budget" htmlFor="budget">
            <select id="budget" name="budget" className={fieldClass} defaultValue={budgets[1]}>
              {budgets.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Project details" htmlFor="message">
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className={`${fieldClass} resize-y`}
            placeholder="Tell us what you're building and what success looks like."
          />
        </Field>

        {status === "error" && error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-glow transition-all hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}
        {optional && <span className="ml-1 text-muted">(optional)</span>}
      </span>
      {children}
    </label>
  );
}
