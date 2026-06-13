"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { applyAcceptance } from "@/lib/quotations";

function loadOwnedSentQuote(id: string, companyId: string | null) {
  const quote = db.select().from(quotations).where(eq(quotations.id, id)).get();
  if (!quote || quote.companyId !== companyId || quote.status !== "sent") {
    return null;
  }
  return quote;
}

export async function acceptQuotation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("quotationId") ?? "");
  const quote = loadOwnedSentQuote(id, user.companyId);
  if (!quote) return;

  applyAcceptance(id, user.name ?? "Client");
  revalidatePath("/portal/quotations");
  revalidatePath("/portal");
}

export async function declineQuotation(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("quotationId") ?? "");
  const quote = loadOwnedSentQuote(id, user.companyId);
  if (!quote) return;

  db.update(quotations)
    .set({ status: "declined" })
    .where(eq(quotations.id, id))
    .run();
  revalidatePath("/portal/quotations");
}
