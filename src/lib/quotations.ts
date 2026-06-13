import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  deals,
  invoices,
  milestones,
  notes,
  projects,
  quotations,
  quotationItems,
} from "@/db/schema";
import { nextInvoiceNumber, releaseMilestones } from "@/lib/billing";

export async function nextQuoteNumber() {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(quotations);
  return `QUO-${1001 + (row?.c ?? 0)}`;
}

export async function nextItemPosition(quotationId: string) {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId));
  return row?.c ?? 0;
}

/**
 * Marks a quote accepted and runs the side effects exactly once: creates a
 * project, wins the linked deal, attaches the payment schedule and bills the
 * milestones due at the start (or the full amount if no schedule). Idempotent
 * via createdProjectId.
 */
export async function applyAcceptance(quotationId: string, actorName: string) {
  const [quote] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .limit(1);
  if (!quote) return null;

  let createdProjectId = quote.createdProjectId;

  if (!createdProjectId) {
    const [project] = await db
      .insert(projects)
      .values({
        companyId: quote.companyId,
        name: quote.title,
        type: quote.projectType,
        status: "active",
        stageIndex: 0,
        startedAt: new Date(),
      })
      .returning();
    createdProjectId = project.id;

    if (quote.dealId) {
      await db.update(deals).set({ stage: "won" }).where(eq(deals.id, quote.dealId));
    }

    // Attach the quote's payment schedule to the new project, then bill.
    const attached = await db
      .update(milestones)
      .set({ projectId: createdProjectId })
      .where(eq(milestones.quotationId, quote.id))
      .returning();

    if (attached.length > 0) {
      await releaseMilestones(createdProjectId, 0);
    } else {
      const [totals] = await db
        .select({
          subtotal: sql<number>`coalesce(sum(${quotationItems.quantity} * ${quotationItems.unitPrice}), 0)::float8`,
        })
        .from(quotationItems)
        .where(eq(quotationItems.quotationId, quote.id));
      const total = (totals?.subtotal ?? 0) * (1 + quote.taxRate / 100);
      if (total > 0) {
        await db.insert(invoices).values({
          companyId: quote.companyId,
          projectId: createdProjectId,
          number: await nextInvoiceNumber(),
          amount: total,
          status: "sent",
          issuedAt: new Date(),
          dueAt: new Date(Date.now() + 14 * 86400000),
        });
      }
    }

    await db.insert(notes).values({
      body: `Quotation ${quote.number} accepted — project “${quote.title}” created.`,
      companyId: quote.companyId,
      projectId: createdProjectId,
      authorName: actorName,
      visibleToClient: true,
    });
  }

  await db
    .update(quotations)
    .set({ status: "accepted", createdProjectId })
    .where(eq(quotations.id, quotationId));

  return createdProjectId;
}
