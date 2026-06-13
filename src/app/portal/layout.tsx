import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AppShell, type NavItem } from "@/components/app/app-shell";

export const dynamic = "force-dynamic";

const nav: NavItem[] = [
  { label: "Overview", href: "/portal", icon: "grid" },
  { label: "Quotations", href: "/portal/quotations", icon: "doc" },
  { label: "Invoices", href: "/portal/invoices", icon: "receipt" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");

  return (
    <AppShell user={user} nav={nav} area="Client portal">
      {children}
    </AppShell>
  );
}
