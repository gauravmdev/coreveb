import "server-only";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  deals,
  notes,
  projects,
  quotations,
  quotationItems,
} from "@/db/schema";

export function nextQuoteNumber() {
  const row = db
    .select({ c: sql<number>`count(*)` })
    .from(quotations)
    .get();
  return `QUO-${1001 + (row?.c ?? 0)}`;
}

export function nextItemPosition(quotationId: string) {
  const row = db
    .select({ c: sql<number>`count(*)` })
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId))
    .get();
  return row?.c ?? 0;
}

/**
 * Marks a quote accepted and runs the side effects exactly once:
 * creates a project from the quote, wins the linked deal, and logs a
 * client-visible note. Safe to call repeatedly (idempotent via
 * createdProjectId).
 */
export function applyAcceptance(quotationId: string, actorName: string) {
  const quote = db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .get();
  if (!quote) return null;

  let createdProjectId = quote.createdProjectId;

  if (!createdProjectId) {
    const project = db
      .insert(projects)
      .values({
        companyId: quote.companyId,
        name: quote.title,
        type: quote.projectType,
        status: "active",
        stageIndex: 0,
        startedAt: new Date(),
      })
      .returning()
      .get();
    createdProjectId = project.id;

    if (quote.dealId) {
      db.update(deals).set({ stage: "won" }).where(eq(deals.id, quote.dealId)).run();
    }

    db.insert(notes)
      .values({
        body: `Quotation ${quote.number} accepted — project “${quote.title}” created.`,
        companyId: quote.companyId,
        projectId: createdProjectId,
        authorName: actorName,
        visibleToClient: true,
      })
      .run();
  }

  db.update(quotations)
    .set({ status: "accepted", createdProjectId })
    .where(eq(quotations.id, quotationId))
    .run();

  return createdProjectId;
}
