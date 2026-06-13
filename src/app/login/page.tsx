import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { auth, signIn } from "@/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to the Coreveb client portal.",
};

const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID);
const devEnabled = process.env.AUTH_DEV_LOGIN === "true";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/portal");
  const { error } = await searchParams;

  async function googleLogin() {
    "use server";
    await signIn("google", { redirectTo: "/portal" });
  }

  async function devLogin(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "").trim();
    try {
      await signIn("dev", { email, redirectTo: "/portal" });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=Enter a valid email");
      throw e;
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="rays" aria-hidden />
      <div className="aurora" aria-hidden />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Image
            src="/coreveb-logo.png"
            alt="Coreveb"
            width={931}
            height={334}
            className="h-12 w-auto mix-blend-screen"
            priority
          />
        </Link>

        <div className="glass rounded-2xl p-8 shadow-glow">
          <h1 className="text-2xl font-semibold tracking-tight">Client portal</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to track your project, invoices, and updates.
          </p>

          {error && (
            <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {error}
            </p>
          )}

          {googleEnabled && (
            <form action={googleLogin} className="mt-6">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm font-medium transition-colors hover:border-brand/50 hover:bg-surface"
              >
                <GoogleGlyph />
                Continue with Google
              </button>
            </form>
          )}

          {googleEnabled && devEnabled && (
            <div className="my-6 flex items-center gap-3 text-xs text-muted">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
          )}

          {devEnabled && (
            <form action={devLogin} className="mt-6 space-y-3">
              <label className="block text-sm font-medium" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/70 focus:border-brand/60"
              />
              <button
                type="submit"
                className="sheen w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-soft"
              >
                Continue
              </button>
              <p className="pt-1 text-center text-xs text-muted">
                Dev sign-in (no password). Try{" "}
                <span className="text-brand-soft">priya@northwind.example</span>{" "}
                (client) or{" "}
                <span className="text-brand-soft">admin@coreveb.com</span> (admin).
              </p>
            </form>
          )}

          {!googleEnabled && !devEnabled && (
            <p className="mt-6 text-sm text-muted">
              No sign-in method is configured. Set <code>AUTH_GOOGLE_ID</code>/
              <code>AUTH_GOOGLE_SECRET</code> or <code>AUTH_DEV_LOGIN=true</code>.
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="hover:text-fg">
            ← Back to coreveb.com
          </Link>
        </p>
      </div>
    </main>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}
