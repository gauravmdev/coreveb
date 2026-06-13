import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/auth";
import type { User } from "@/db/schema";

export function AppHeader({
  user,
  nav,
  area,
}: {
  user: User;
  nav: { label: string; href: string }[];
  area: "Client portal" | "Admin";
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-3" aria-label="Coreveb home">
          <Image
            src="/coreveb-logo.png"
            alt="Coreveb"
            width={931}
            height={334}
            className="h-8 w-auto mix-blend-screen"
          />
          <span className="hidden rounded-full border border-border px-2.5 py-1 text-[10px] uppercase tracking-widest text-muted sm:inline">
            {area}
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-right sm:block">
            <span className="block text-sm leading-tight">{user.name ?? "You"}</span>
            <span className="block text-xs leading-tight text-muted">{user.email}</span>
          </span>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/20 text-sm font-semibold text-brand-soft">
            {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-brand/50 hover:text-fg"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-2 md:hidden">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-fg"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
