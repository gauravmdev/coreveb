import "server-only";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import { db } from "@/db";
import {
  companies,
  deals,
  invoices,
  messages,
  milestones,
  notes,
  projects,
  proposalSections,
  quotations,
  quotationItems,
  users,
} from "@/db/schema";

/* --------------------------------- Portal --------------------------------- */

export async function getCompany(companyId: string) {
  const [row] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
  return row;
}

export function getCompanyProjects(companyId: string) {
  return db
    .select()
    .from(projects)
    .where(eq(projects.companyId, companyId))
    .orderBy(desc(projects.createdAt));
}

export async function getProject(id: string) {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row;
}

export function getCompanyInvoices(companyId: string) {
  return db
    .select()
    .from(invoices)
    .where(eq(invoices.companyId, companyId))
    .orderBy(desc(invoices.issuedAt));
}

export function getClientNotes(companyId: string) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.companyId, companyId), eq(notes.visibleToClient, true)))
    .orderBy(desc(notes.createdAt));
}

export function getProjectNotes(projectId: string, onlyClientVisible = false) {
  const where = onlyClientVisible
    ? and(eq(notes.projectId, projectId), eq(notes.visibleToClient, true))
    : eq(notes.projectId, projectId);
  return db.select().from(notes).where(where).orderBy(desc(notes.createdAt));
}

export function getCompanyUsers(companyId: string) {
  return db.select().from(users).where(eq(users.companyId, companyId));
}

export function getCompanyNotes(companyId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.companyId, companyId))
    .orderBy(desc(notes.createdAt));
}

/* -------------------------------- Messages -------------------------------- */

export function getProjectMessages(projectId: string) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.projectId, projectId))
    .orderBy(messages.createdAt);
}

/* ------------------------------- Milestones ------------------------------- */

export function getQuotationMilestones(quotationId: string) {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.quotationId, quotationId))
    .orderBy(milestones.position);
}

export function getProjectMilestones(projectId: string) {
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.projectId, projectId))
    .orderBy(milestones.position);
}

/* ------------------------------- Quotations ------------------------------- */

export function getQuotationItems(quotationId: string) {
  return db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, quotationId))
    .orderBy(quotationItems.position);
}

export async function getQuotation(id: string) {
  const [row] = await db.select().from(quotations).where(eq(quotations.id, id)).limit(1);
  return row;
}

export function getProposalSections(quotationId: string) {
  return db
    .select()
    .from(proposalSections)
    .where(eq(proposalSections.quotationId, quotationId))
    .orderBy(proposalSections.position);
}

export function listQuotations() {
  return db
    .select({ quote: quotations, companyName: companies.name })
    .from(quotations)
    .leftJoin(companies, eq(quotations.companyId, companies.id))
    .orderBy(desc(quotations.createdAt));
}

export function getCompanyQuotations(companyId: string) {
  return db
    .select()
    .from(quotations)
    .where(and(eq(quotations.companyId, companyId), ne(quotations.status, "draft")))
    .orderBy(desc(quotations.createdAt));
}

export async function quotationTotals() {
  const rows = await db
    .select({
      quotationId: quotationItems.quotationId,
      subtotal: sql<number>`coalesce(sum(${quotationItems.quantity} * ${quotationItems.unitPrice}), 0)::float8`,
    })
    .from(quotationItems)
    .groupBy(quotationItems.quotationId);
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.quotationId, r.subtotal);
  return map;
}

/* --------------------------------- Admin ---------------------------------- */

export function listCompanies() {
  return db.select().from(companies).orderBy(desc(companies.createdAt));
}

export function listProjectsWithCompany() {
  return db
    .select({ project: projects, companyName: companies.name })
    .from(projects)
    .leftJoin(companies, eq(projects.companyId, companies.id))
    .orderBy(desc(projects.createdAt));
}

export function listDeals() {
  return db
    .select({ deal: deals, companyName: companies.name })
    .from(deals)
    .leftJoin(companies, eq(deals.companyId, companies.id))
    .orderBy(desc(deals.createdAt));
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
    .orderBy(desc(invoices.issuedAt));
}

async function count(table: PgTable) {
  const [row] = await db.select({ c: sql<number>`count(*)::int` }).from(table);
  return row?.c ?? 0;
}

export async function getAdminOverview() {
  const [openInvoices] = await db
    .select({
      total: sql<number>`coalesce(sum(${invoices.amount}), 0)::float8`,
    })
    .from(invoices)
    .where(sql`${invoices.status} in ('sent','overdue')`);

  const [wonValue] = await db
    .select({ total: sql<number>`coalesce(sum(${deals.value}), 0)::float8` })
    .from(deals)
    .where(eq(deals.stage, "won"));

  const [pendingQuotes] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(quotations)
    .where(eq(quotations.status, "sent"));

  return {
    companies: await count(companies),
    projects: await count(projects),
    deals: await count(deals),
    quotations: await count(quotations),
    pendingQuotes: pendingQuotes?.c ?? 0,
    invoices: await count(invoices),
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
    .limit(limit);
}
