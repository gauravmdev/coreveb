import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getUnreadTotal } from "@/lib/queries";
import { AppShell, type NavItem } from "@/components/app/app-shell";
import { WhatsAppButton } from "@/components/whatsapp-button";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");
  const unread = await getUnreadTotal(user);
  const theme = (await cookies()).get("theme")?.value === "light" ? "light" : "dark";

  const nav: NavItem[] = [
    { label: "Overview", href: "/portal", icon: "grid" },
    { label: "Messages", href: "/portal/messages", icon: "chat", badge: unread },
    { label: "Quotations", href: "/portal/quotations", icon: "doc" },
    { label: "Invoices", href: "/portal/invoices", icon: "receipt" },
    { label: "AI Help", href: "/portal/assistant", icon: "spark" },
  ];

  return (
    <>
      <AppShell user={user} nav={nav} area="Client portal" theme={theme}>
        {children}
      </AppShell>
      <WhatsAppButton />
    </>
  );
}
