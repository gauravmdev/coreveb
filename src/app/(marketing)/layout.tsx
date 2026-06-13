import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RevealObserver } from "@/components/reveal-observer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <RevealObserver />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
