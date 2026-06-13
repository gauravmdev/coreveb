import Link from "next/link";
import Image from "next/image";
import { nav, site } from "@/lib/site";
import { Container } from "@/components/ui";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-bg-soft">
      <Container className="py-14">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex" aria-label="Coreveb — home">
              <Image
                src="/coreveb-logo-dark.png"
                alt="Coreveb — Software & Digital Marketing"
                width={1110}
                height={397}
                className="h-12 w-auto"
              />
            </Link>
            <p className="mt-5 text-sm text-muted">{site.description}</p>
          </div>

          <div className="flex gap-14">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Navigate
              </h3>
              <ul className="mt-4 space-y-3">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
                Connect
              </h3>
              <ul className="mt-4 space-y-3">
                {site.socials.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-muted transition-colors hover:text-fg"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/60 pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <a href={`mailto:${site.email}`} className="hover:text-fg">
            {site.email}
          </a>
        </div>
      </Container>
    </footer>
  );
}
