"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  companies,
  deals,
  invoices,
  notes,
  projects,
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

const str = (v: FormDataEntryValue | null) => String(v ?? "").trim();
const num = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const date = (v: FormDataEntryValue | null) => {
  const s = str(v);
  return s ? new Date(s) : null;
};

/* ------------------------------- Companies -------------------------------- */

export async function createCompany(formData: FormData) {
  await requireAdmin();
  const name = str(formData.get("name"));
  if (!name) return;
  const company = db
    .insert(companies)
    .values({
      name,
      website: str(formData.get("website")) || null,
      industry: str(formData.get("industry")) || null,
      contactName: str(formData.get("contactName")) || null,
      contactEmail: str(formData.get("contactEmail")) || null,
    })
    .returning()
    .get();
  revalidatePath("/admin/clients");
  redirect(`/admin/clients/${company.id}`);
}

export async function linkUser(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const email = str(formData.get("email")).toLowerCase();
  if (!companyId || !email.includes("@")) return;

  const existing = db.select().from(users).where(eq(users.email, email)).get();
  if (existing) {
    db.update(users).set({ companyId }).where(eq(users.id, existing.id)).run();
  } else {
    db.insert(users)
      .values({ email, name: email.split("@")[0], role: "client", companyId })
      .run();
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

  db.insert(projects)
    .values({
      companyId,
      name,
      type,
      description: str(formData.get("description")) || null,
      startedAt: date(formData.get("startedAt")) ?? new Date(),
      targetDate: date(formData.get("targetDate")),
    })
    .run();
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
  db.update(projects)
    .set({ stageIndex, status })
    .where(eq(projects.id, id))
    .run();
  revalidatePath("/admin/projects");
  revalidatePath("/portal");
}

/* ---------------------------------- Deals --------------------------------- */

export async function createDeal(formData: FormData) {
  await requireAdmin();
  const title = str(formData.get("title"));
  if (!title) return;
  db.insert(deals)
    .values({
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
    })
    .run();
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
  db.update(deals).set({ stage }).where(eq(deals.id, id)).run();
  revalidatePath("/admin/deals");
}

/* -------------------------------- Invoices -------------------------------- */

export async function createInvoice(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const number = str(formData.get("number"));
  if (!companyId || !number) return;
  db.insert(invoices)
    .values({
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
    })
    .run();
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
  db.update(invoices).set({ status }).where(eq(invoices.id, id)).run();
  revalidatePath("/admin/invoices");
  revalidatePath("/portal");
}

/* ------------------------------- Quotations ------------------------------- */

export async function createQuotation(formData: FormData) {
  await requireAdmin();
  const companyId = str(formData.get("companyId"));
  const title = str(formData.get("title"));
  if (!companyId || !title) return;

  const quote = db
    .insert(quotations)
    .values({
      companyId,
      title,
      number: nextQuoteNumber(),
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
    .returning()
    .get();
  redirect(`/admin/quotations/${quote.id}`);
}

export async function addQuotationItem(formData: FormData) {
  await requireAdmin();
  const quotationId = str(formData.get("quotationId"));
  const description = str(formData.get("description"));
  if (!quotationId || !description) return;
  db.insert(quotationItems)
    .values({
      quotationId,
      description,
      quantity: num(formData.get("quantity")) || 1,
      unitPrice: num(formData.get("unitPrice")),
      position: nextItemPosition(quotationId),
    })
    .run();
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function deleteQuotationItem(formData: FormData) {
  await requireAdmin();
  const id = str(formData.get("itemId"));
  const quotationId = str(formData.get("quotationId"));
  if (!id) return;
  db.delete(quotationItems).where(eq(quotationItems.id, id)).run();
  revalidatePath(`/admin/quotations/${quotationId}`);
}

export async function setQuotationStatus(formData: FormData) {
  const admin = await requireAdmin();
  const id = str(formData.get("quotationId"));
  const status = str(formData.get("status"));
  if (!id || !status) return;

  if (status === "accepted") {
    applyAcceptance(id, admin.name ?? "Coreveb");
  } else {
    db.update(quotations)
      .set({
        status: status as "draft" | "sent" | "declined" | "expired",
      })
      .where(eq(quotations.id, id))
      .run();
  }
  revalidatePath(`/admin/quotations/${id}`);
  revalidatePath("/admin/quotations");
  revalidatePath("/portal");
}

/* ---------------------------------- Notes --------------------------------- */

export async function addNote(formData: FormData) {
  const admin = await requireAdmin();
  const body = str(formData.get("body"));
  const companyId = str(formData.get("companyId"));
  if (!body || !companyId) return;
  db.insert(notes)
    .values({
      body,
      companyId,
      projectId: str(formData.get("projectId")) || null,
      authorId: admin.id,
      authorName: admin.name ?? "Coreveb",
      visibleToClient: str(formData.get("visibleToClient")) === "on",
    })
    .run();
  revalidatePath(`/admin/clients/${companyId}`);
  revalidatePath("/portal");
}
