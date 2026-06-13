import { requireAdmin } from "@/lib/session";
import { AppHeader } from "@/components/app/app-header";

export const dynamic = "force-dynamic";

const nav = [
  { label: "Overview", href: "/admin" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Deals", href: "/admin/deals" },
  { label: "Quotations", href: "/admin/quotations" },
  { label: "Invoices", href: "/admin/invoices" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-bg">
      <AppHeader user={user} nav={nav} area="Admin" />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
