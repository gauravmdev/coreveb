import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { AppHeader } from "@/components/app/app-header";

export const dynamic = "force-dynamic";

const nav = [
  { label: "Overview", href: "/portal" },
  { label: "Quotations", href: "/portal/quotations" },
  { label: "Invoices", href: "/portal/invoices" },
];

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  if (user.role === "admin") redirect("/admin");

  return (
    <div className="min-h-screen bg-bg">
      <AppHeader user={user} nav={nav} area="Client portal" />
      <main className="mx-auto w-full max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}
