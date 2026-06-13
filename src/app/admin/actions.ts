"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  deals,
  invoices,
  milestones,
  notes,
  projects,
  proposalSections,
  quotations,
  quotationItems,
  users,
} from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import {
  applyAcceptance,
  nextItemPosition,
  nextQuoteNumber,
} from "@/lib/quotations";
import {
  invoiceMilestone,
  releaseMilestones,
  syncMilestoneForInvoice,
} from "@/lib/billing";
import { stagesFor, type ProjectType } from "@/lib/crm";

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const num = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const date = (v: FormDataEntryValue | null) => {
  const s = str(v);
  return s ? new Date(s) : null;
};
const intOrNull = (v: FormDataEntryValue | null) => {
  const s = str(v);
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/* ------------------------------- Companies -------------------------------- */

export async function createCompany(formData: FormData) {
  await requireAdmin();
  const name = str(formData.get("name"));
  if (!name) return;
  const [company] = await db
    .insert(companies)
    .values({
      name,
      website: str(formData.get("website")) || null,
      industry: str(formData.get("industry")) || null,
      contactName: str(formData.get("contactName")) || null,
      contactEmail: str(formData.get("contactEmail")) || null,
    })
    .returning();
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${company.id}`);
}

export async function linkUser(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const email = str(formData.get("email")).toLowerCase();
  if (!companyId || !email.includes("@")) return;

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    await db.update(users).set({ companyId }).where(eq(users.id, existing.id));
  } else {
    await db
      .insert(users)
      .values({ email, name: email.split("@")[0], role: "client", companyId });
  }
  revalidatePath(`/admin/clients/${companyId}`);
}

/* -------------------------------- Projects -------------------------------- */

export async function createProject(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const name = str(formData.get("name"));
  const type = str(formData.get("type")) as
    | "software"
    | "web"
    | "mobile"
    | "marketing";
  if (!companyId || !name || !type) return;

  await db.insert(projects).values({
    companyId,
    name,
    type,
    description: str(formData.get("description")) || null,
    startedAt: date(formData.get("startedAt")) ?? new Date(),
    targetDate: date(formData.get("targetDate")),
  });
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/clients/${companyId}`);
}

export async function updateProjectProgress(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("projectId"));
  if (!id) return;
  const stageIndex = Math.max(0, num(formData.get("stageIndex")));
  const status = str(formData.get("status")) as
    | "active"
    | "on_hold"
    | "completed"
    | "cancelled";
  await db.update(projects).set({ stageIndex, status }).where(eq(projects.id, id));
  await releaseMilestones(id, stageIndex);
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/portal");
}

export async function requestStageApproval(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("projectId"));
  if (!id) return;
  const [project] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!project) return;

  await db.update(projects).set({ awaitingApproval: true }).where(eq(projects.id, id));
  const stage = stagesFor(project.type as ProjectType)[project.stageIndex] ?? "current";
  await db.insert(notes).values({
    body: `Sign-off requested on the ${stage} stage.`,
    companyId: project.companyId,
    projectId: id,
    authorName: "Coreveb",
    visibleToClient: true,
  });
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/portal");
}

export async function cancelStageApproval(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("projectId"));
  if (!id) return;
  await db.update(projects).set({ awaitingApproval: false }).where(eq(projects.id, id));
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath("/portal");
}

/* ---------------------------------- Deals --------------------------------- */

export async function createDeal(formData: FormData) {
  await requireAdmin();
  const title = str(formData.get("title"));
  if (!title) return;
  await db.insert(deals).values({
    title,
    companyId: str(formData.get("companyId")) || null,
    contactName: str(formData.get("contactName")) || null,
    contactEmail: str(formData.get("contactEmail")) || null,
    value: num(formData.get("value")),
    stage: (str(formData.get("stage")) || "lead") as
      | "lead"
      | "qualified"
      | "proposal"
      | "won"
      | "lost",
  });
  revalidatePath("/admin/deals");
}

export async function setDealStage(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("dealId"));
  const stage = str(formData.get("stage")) as
    | "lead"
    | "qualified"
    | "proposal"
    | "won"
    | "lost";
  if (!id || !stage) return;
  await db.update(deals).set({ stage }).where(eq(deals.id, id));
  revalidatePath("/admin/deals");
}

/* -------------------------------- Invoices -------------------------------- */

export async function createInvoice(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const number = str(formData.get("number"));
  if (!companyId || !number) return;
  await db.insert(invoices).values({
    companyId,
    projectId: str(formData.get("projectId")) || null,
    number,
    amount: num(formData.get("amount")),
    status: (str(formData.get("status")) || "draft") as
      | "draft"
      | "sent"
      | "paid"
      | "overdue",
    issuedAt: date(formData.get("issuedAt")) ?? new Date(),
    dueAt: date(formData.get("dueAt")),
  });
  revalidatePath("/admin/invoices");
}

export async function setInvoiceStatus(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("invoiceId"));
  const status = str(formData.get("status")) as
    | "draft"
    | "sent"
    | "paid"
    | "overdue";
  if (!id || !status) return;
  await db.update(invoices).set({ status }).where(eq(invoices.id, id));
  await syncMilestoneForInvoice(id, status);
  revalidatePath("/admin/invoices");
  revalidatePath("/portal");
}

/* ------------------------------- Quotations ------------------------------- */

export async function createQuotation(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const title = str(formData.get("title"));
  if (!companyId || !title) return;

  const [quote] = await db
    .insert(quotations)
    .values({
      companyId,
      title,
      number: await nextQuoteNumber(),
      projectType: (str(formData.get("projectType")) || "web") as
        | "software"
        | "web"
        | "mobile"
        | "marketing",
      taxRate: num(formData.get("taxRate")),
      dealId: str(formData.get("dealId")) || null,
      terms: str(formData.get("terms")) || null,
      validUntil: date(formData.get("validUntil")),
    })
    .returning();
  redirect(`/admin/quotations/${quote.id}`);
}

export async function addQuotationItem(formData: FormData) {
  await requireAdmin();
  const quotationId = str(formData.get("quotationId"));
  const description = str(formData.get("description"));
  if (!quotationId || !description) return;
  await db.insert(quotationItems).values({
    quotationId,
    description,
    quantity: num(formData.get("quantity")) || 1,
    unitPrice: num(formData.get("unitPrice")),
    position: await nextItemPosition(quotationId),
  });
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function deleteQuotationItem(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("itemId"));
  const quotationId = str(formData.get("quotationId"));
  if (!id) return;
  await db.delete(quotationItems).where(eq(quotationItems.id, id));
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function setQuotationStatus(formData: FormData) {
  const admin = await requireAdmin();
  const id = str(formData.get("quotationId"));
  const status = str(formData.get("status"));
  if (!id || !status) return;

  if (status === "accepted") {
    await applyAcceptance(id, admin.name ?? "Coreveb");
  } else {
    await db
      .update(quotations)
      .set({ status: status as "draft" | "sent" | "declined" | "expired" })
      .where(eq(quotations.id, id));
  }
  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
  revalidatePath("/portal");
}

/* ------------------------------- Proposal --------------------------------- */

export async function updateProposalMeta(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("quotationId"));
  if (!id) return;
  await db
    .update(quotations)
    .set({
      subtitle: str(formData.get("subtitle")) || null,
      currency: str(formData.get("currency")) || "INR",
      taxLabel: str(formData.get("taxLabel")) || "GST",
    })
    .where(eq(quotations.id, id));
  revalidatePath(`/admin/quotations/${id}`);
}

export async function addProposalSection(formData: FormData) {
  await requireAdmin();
  const quotationId = str(formData.get("quotationId"));
  const heading = str(formData.get("heading"));
  const body = str(formData.get("body"));
  if (!quotationId || !heading || !body) return;
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(proposalSections)
    .where(eq(proposalSections.quotationId, quotationId));
  await db.insert(proposalSections).values({
    quotationId,
    heading,
    body,
    position: row?.c ?? 0,
  });
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function deleteProposalSection(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("sectionId"));
  const quotationId = str(formData.get("quotationId"));
  if (!id) return;
  await db.delete(proposalSections).where(eq(proposalSections.id, id));
  revalidatePath(`/admin/quotations/${quotationId}`);
}

/* ---------------------------- Payment milestones -------------------------- */

async function milestonePosition(where: SQL | undefined) {
  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(milestones)
    .where(where);
  return row?.c ?? 0;
}

export async function addQuotationMilestone(formData: FormData) {
  await requireAdmin();
  const quotationId = str(formData.get("quotationId"));
  const label = str(formData.get("label"));
  if (!quotationId || !label) return;
  const [quote] = await db
    .select()
    .from(quotations)
    .where(eq(quotations.id, quotationId))
    .limit(1);
  if (!quote) return;

  await db.insert(milestones).values({
    companyId: quote.companyId,
    quotationId,
    label,
    amount: num(formData.get("amount")),
    triggerStageIndex: intOrNull(formData.get("triggerStageIndex")),
    position: await milestonePosition(eq(milestones.quotationId, quotationId)),
  });
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function deleteMilestone(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("milestoneId"));
  const back = str(formData.get("back"));
  if (!id) return;
  await db.delete(milestones).where(eq(milestones.id, id));
  if (back) revalidatePath(back);
}

export async function addProjectMilestone(formData: FormData) {
  await requireAdmin();
  const projectId = str(formData.get("projectId"));
  const label = str(formData.get("label"));
  if (!projectId || !label) return;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) return;

  await db.insert(milestones).values({
    companyId: project.companyId,
    projectId,
    label,
    amount: num(formData.get("amount")),
    triggerStageIndex: intOrNull(formData.get("triggerStageIndex")),
    position: await milestonePosition(eq(milestones.projectId, projectId)),
  });
  revalidatePath(`/admin/projects/${projectId}`);
}

export async function generateMilestoneInvoice(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("milestoneId"));
  const projectId = str(formData.get("projectId"));
  if (!id) return;
  await invoiceMilestone(id);
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/invoices");
  revalidatePath("/portal");
}

/* ---------------------------------- Notes --------------------------------- */

export async function addNote(formData: FormData) {
  const admin = await requireAdmin();
  const body = str(formData.get("body"));
  const companyId = str(formData.get("companyId"));
  if (!body || !companyId) return;
  await db.insert(notes).values({
    body,
    companyId,
    projectId: str(formData.get("projectId")) || null,
    authorId: admin.id,
    authorName: admin.name ?? "Coreveb",
    visibleToClient: str(formData.get("visibleToClient")) === "on",
  });
  revalidatePath(`/admin/clients/${companyId}`);
  revalidatePath("/portal");
}
