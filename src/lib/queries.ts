import "server-only";
import { and, desc, eq, ne, sql } from "drizzle-orm";
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

/* --------------------------------- Portal --------------------------------- */

export function getCompany(companyId: string) {
  return db.select().from(companies).where(eq(companies.id, companyId)).get();
}

export function getCompanyProjects(companyId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.companyId, companyId))
    .orderBy(desc(projects.createdAt))
    .all();
}

export function getProject(id: string) {
  return db.select().from(projects).where(eq(projects.id, id)).get();
}

export function getCompanyInvoices(companyId: string) {
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.companyId, companyId))
    .orderBy(desc(invoices.issuedAt))
    .all();
}

export function getClientNotes(companyId: string) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.companyId, companyId), eq(notes.visibleToClient, true)))
    .orderBy(desc(notes.createdAt))
    .all();
}

export function getProjectNotes(projectId: string, onlyClientVisible = false) {
  const where = onlyClientVisible
    ? and(eq(notes.projectId, projectId), eq(notes.visibleToClient, true))
    : eq(notes.projectId, projectId);
  return db.select().from(notes).where(where).orderBy(desc(notes.createdAt)).all();
}

export function getCompanyUsers(companyId: string) {
  return db.select().from(users).where(eq(users.companyId, companyId)).all();
}

export function getCompanyNotes(companyId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.companyId, companyId))
    .orderBy(desc(notes.createdAt))
    .all();
}

/* --------------------------------- Admin ---------------------------------- */

export function listCompanies() {
  return db.select().from(companies).orderBy(desc(companies.createdAt)).all();
}

export function listProjectsWithCompany() {
  return db
    .select({
      project: projects,
      companyName: companies.name,
    })
    .from(projects)
    .leftJoin(companies, eq(projects.companyId, companies.id))
    .orderBy(desc(projects.createdAt))
    .all();
}

export function listDeals() {
  return db
    .select({ deal: deals, companyName: companies.name })
    .from(deals)
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .orderBy(desc(deals.createdAt))
    .all();
}

export function listInvoicesWithRefs() {
  return db
    .select({
      invoice: invoices,
      companyName: companies.name,
      projectName: projects.name,
    })
    .from(invoices)
    .leftJoin(companies, eq(invoices.companyId, companies.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .orderBy(desc(invoices.issuedAt))
    .all();
}

/* ------------------------------- Quotations ------------------------------- */

export function getQuotationItems(quotationId: string) {
  return db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId))
    .orderBy(quotationItems.position)
    .all();
}

export function getQuotation(id: string) {
  return db.select().from(quotations).where(eq(quotations.id, id)).get();
}

export function listQuotations() {
  return db
    .select({ quote: quotations, companyName: companies.name })
    .from(quotations)
    .leftJoin(companies, eq(quotations.companyId, companies.id))
    .orderBy(desc(quotations.createdAt))
    .all();
}

export function getCompanyQuotations(companyId: string) {
  return db
    .select()
    .from(quotations)
    .where(and(eq(quotations.companyId, companyId), ne(quotations.status, "draft")))
    .orderBy(desc(quotations.createdAt))
    .all();
}

/** quotationId -> total amount (incl. tax), for list views. */
export function quotationTotals() {
  const rows = db
    .select({
      quotationId: quotationItems.quotationId,
      subtotal: sql<number>`coalesce(sum(${quotationItems.quantity} * ${quotationItems.unitPrice}), 0)`,
    })
    .from(quotationItems)
    .groupBy(quotationItems.quotationId)
    .all();
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.quotationId, r.subtotal);
  return map;
}

function count(
  table:
    | typeof companies
    | typeof projects
    | typeof deals
    | typeof invoices
    | typeof quotations,
) {
  const row = db.select({ c: sql<number>`count(*)` }).from(table).get();
  return row?.c ?? 0;
}

export function getAdminOverview() {
  const openInvoices = db
    .select({ total: sql<number>`coalesce(sum(${invoices.amount}), 0)` })
    .from(invoices)
    .where(sql`${invoices.status} in ('sent','overdue')`)
    .get();

  const wonValue = db
    .select({ total: sql<number>`coalesce(sum(${deals.value}), 0)` })
    .from(deals)
    .where(eq(deals.stage, "won"))
    .get();

  const pendingQuotes = db
    .select({ c: sql<number>`count(*)` })
    .from(quotations)
    .where(eq(quotations.status, "sent"))
    .get();

  return {
    companies: count(companies),
    projects: count(projects),
    deals: count(deals),
    quotations: count(quotations),
    pendingQuotes: pendingQuotes?.c ?? 0,
    invoices: count(invoices),
    outstanding: openInvoices?.total ?? 0,
    wonValue: wonValue?.total ?? 0,
  };
}

export function listRecentNotes(limit = 8) {
  return db
    .select({ note: notes, companyName: companies.name })
    .from(notes)
    .leftJoin(companies, eq(notes.companyId, companies.id))
    .orderBy(desc(notes.createdAt))
    .limit(limit)
    .all();
}
