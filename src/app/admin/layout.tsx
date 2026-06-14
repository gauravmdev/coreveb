import { cookies } from "next/headers";
import { requireAdmin } from "@/lib/session";
import { countNewLeads, getUnreadTotal } from "@/lib/queries";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  const unread = await getUnreadTotal(user);
  const newLeads = await countNewLeads();
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";

  const nav: NavItem[] = [
    { label: "Overview", href: "/admin", icon: "grid" },
    { label: "Leads", href: "/admin/leads", icon: "send", badge: newLeads },
    { label: "Clients", href: "/admin/clients", icon: "users" },
    { label: "Projects", href: "/admin/projects", icon: "folder" },
    { label: "Messages", href: "/admin/messages", icon: "chat", badge: unread },
    { label: "Deals", href: "/admin/deals", icon: "target" },
    { label: "Quotations", href: "/admin/quotations", icon: "doc" },
    { label: "Invoices", href: "/admin/invoices", icon: "receipt" },
    { label: "AI Help", href: "/admin/assistant", icon: "spark" },
    { label: "Settings", href: "/admin/settings", icon: "shield" },
  ];

  return (
    <>
      <AppShell user={user} nav={nav} area="Admin" theme={theme}>
        {children}
      </AppShell>
      <WhatsAppButton />
    </>
  );
}
