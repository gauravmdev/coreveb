import "server-only";
import { and, asc, eq, isNotNull, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { invoices, milestones } from "@/db/schema";

const DUE_DAYS = 14;
const addDays = (n: number) => new Date(Date.now() + n * 86400000);

export async function nextInvoiceNumber() {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(invoices);
  return `INV-${1001 + (row?.c ?? 0)}`;
}

/** Creates a 'sent' invoice for a milestone and marks it invoiced. */
export async function invoiceMilestone(milestoneId: string) {
  const [m] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.id, milestoneId))
    .limit(1);
  if (!m || m.status !== "pending") return null;

  const [invoice] = await db
    .insert(invoices)
    .values({
      companyId: m.companyId,
      projectId: m.projectId,
      number: await nextInvoiceNumber(),
      amount: m.amount,
      status: "sent",
      issuedAt: new Date(),
      dueAt: addDays(DUE_DAYS),
    })
    .returning();

  await db
    .update(milestones)
    .set({ status: "invoiced", invoiceId: invoice.id })
    .where(eq(milestones.id, milestoneId));

  return invoice;
}

/**
 * Auto-releases invoices for every pending milestone whose trigger stage has
 * been reached. Called on quote acceptance and on every project stage update.
 */
export async function releaseMilestones(projectId: string, stageIndex: number) {
  const due = await db
    .select()
    .from(milestones)
    .where(
      and(
        eq(milestones.projectId, projectId),
        eq(milestones.status, "pending"),
        isNotNull(milestones.triggerStageIndex),
        lte(milestones.triggerStageIndex, stageIndex),
      ),
    )
    .orderBy(asc(milestones.position));

  for (const m of due) await invoiceMilestone(m.id);
  return due.length;
}

/** Keeps a milestone's status in sync when its invoice changes. */
export async function syncMilestoneForInvoice(
  invoiceId: string,
  invoiceStatus: string,
) {
  const [m] = await db
    .select()
    .from(milestones)
    .where(eq(milestones.invoiceId, invoiceId))
    .limit(1);
  if (!m) return;
  const status = invoiceStatus === "paid" ? "paid" : "invoiced";
  await db.update(milestones).set({ status }).where(eq(milestones.id, m.id));
}
