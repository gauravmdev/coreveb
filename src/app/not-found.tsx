import Link from "next/link";

export default function NotFound() {
  return (
    <main className="theme-dark grid min-h-screen place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-md text-center">
        <p className="font-mono text-sm tracking-widest text-brand-soft">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-muted">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-soft"
          >
            Back home
          </Link>
          <Link
            href="/portal"
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
          >
            Go to portal
          </Link>
        </div>
      </div>
    </main>
  );
}
