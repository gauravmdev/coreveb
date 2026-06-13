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
                  className="hover:text-brand-soft"
                >
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
