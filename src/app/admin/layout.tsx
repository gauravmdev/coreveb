import { requireAdmin } from "@/lib/session";
import { getUnreadTotal } from "@/lib/queries";
import { AppShell, type NavItem } from "@/components/app/app-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const unread = await getUnreadTotal(user);

  const nav: NavItem[] = [
    { label: "Overview", href: "/admin", icon: "grid" },
    { label: "Clients", href: "/admin/clients", icon: "users" },
    { label: "Projects", href: "/admin/projects", icon: "folder" },
    { label: "Messages", href: "/admin/messages", icon: "chat", badge: unread },
    { label: "Deals", href: "/admin/deals", icon: "target" },
    { label: "Quotations", href: "/admin/quotations", icon: "doc" },
    { label: "Invoices", href: "/admin/invoices", icon: "receipt" },
  ];

  return (
    <AppShell user={user} nav={nav} area="Admin">
      {children}
    </AppShell>
  );
}
