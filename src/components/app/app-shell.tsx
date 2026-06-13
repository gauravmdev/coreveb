"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";
import { signOutAction } from "@/app/auth-actions";
import type { User } from "@/db/schema";

export type NavItem = { label: string; href: string; icon: IconName };

export function AppShell({
  user,
  nav,
  area,
  children,
}: {
  user: User;
  nav: NavItem[];
  area: "Client portal" | "Admin";
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootHref = nav[0]?.href;

  const isActive = (href: string) =>
    pathname === href || (href !== rootHref && pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <Image
            src="/coreveb-logo.png"
            alt="Coreveb"
            width={931}
            height={334}
            className="h-7 w-auto mix-blend-screen"
          />
        </Link>
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-widest text-muted">
          {area === "Admin" ? "Admin" : "Portal"}
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {nav.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-brand/15 font-medium text-fg"
                  : "text-muted hover:bg-surface hover:text-fg"
              }`}
            >
              <Icon
                name={item.icon}
                className={`h-[18px] w-[18px] ${active ? "text-brand-soft" : ""}`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/20 text-sm font-semibold text-brand-soft">
            {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{user.name ?? "You"}</span>
            <span className="block truncate text-xs text-muted">{user.email}</span>
          </span>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface hover:text-fg"
          >
            <Icon name="logout" className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-bg-soft lg:block">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border/60 bg-bg-soft">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-bg/80 px-5 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
          >
            <span className="text-lg leading-none">☰</span>
          </button>
          <span className="text-sm font-medium text-muted">
            {area === "Admin" ? "Admin" : "Client portal"}
          </span>
          <span className="ml-auto grid h-8 w-8 place-items-center rounded-full bg-brand/20 text-xs font-semibold text-brand-soft lg:hidden">
            {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
          </span>
        </header>

        <main className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
