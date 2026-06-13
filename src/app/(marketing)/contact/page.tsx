import type { Metadata } from "next";
import { Container, Eyebrow } from "@/components/ui";
import { ContactForm } from "@/components/contact-form";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us about your project and we'll get back within one business day.",
};

export default function ContactPage() {
  return (
    <Container className="py-20 sm:py-28">
      <div className="grid gap-14 lg:grid-cols-2">
        <div>
          <Eyebrow>Start a project</Eyebrow>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Let&apos;s build something worth shipping.
          </h1>
          <p className="mt-5 max-w-md text-muted">
            Share a little about what you have in mind — software, a mobile app,
            a marketing push, or all three. We&apos;ll reply within one business
            day.
          </p>

          <dl className="mt-10 space-y-4 text-sm">
            <div className="flex gap-3">
              <dt className="w-20 text-muted">Email</dt>
              <dd>
                <a href={`mailto:${site.email}`} className="hover:text-brand-soft">
                  {site.email}
                </a>
              </dd>
            </div>
            <div className="flex gap-3">
              <dt className="w-20 text-muted">WhatsApp</dt>
              <dd>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 transition-colors hover:text-brand-soft"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0"
                    fill="#25D366"
                    role="img"
                    aria-label="WhatsApp"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  {site.phone}
                </a>
              </dd>
            </div>
            {site.socials.length > 0 && (
              <div className="flex gap-3">
                <dt className="w-20 text-muted">Social</dt>
                <dd className="flex gap-4">
                  {site.socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-brand-soft"
                    >
                      {s.label}
                    </a>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <ContactForm />
      </div>
    </Container>
  );
}
