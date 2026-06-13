import "server-only";
import { and, desc, eq, inArray, ne, sql } from "drizzle-orm";
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
  threadReads,
  users,
} from "@/db/schema";
import type { User } from "@/db/schema";

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

export type QuoteCard = {
  id: string;
  number: string;
  title: string;
  status: string;
  currency: string;
  total: number;
};
export type InvoiceCard = {
  id: string;
  number: string;
  amount: number;
  status: string;
  dueAt: Date | null;
};

/** Loads a project's thread plus the data needed to render attachment cards. */
export async function getThreadData(projectId: string, user: User) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  const msgs = await getProjectMessages(projectId);

  const quoteIds = [
    ...new Set(
      msgs
        .filter((m) => m.attachmentType === "quote" && m.attachmentId)
        .map((m) => m.attachmentId as string),
    ),
  ];
  const invoiceIds = [
    ...new Set(
      msgs
        .filter((m) => m.attachmentType === "invoice" && m.attachmentId)
        .map((m) => m.attachmentId as string),
    ),
  ];

  const quotes: Record<string, QuoteCard> = {};
  if (quoteIds.length) {
    const rows = await db
      .select()
      .from(quotations)
      .where(inArray(quotations.id, quoteIds));
    const totals = await db
      .select({
        qid: quotationItems.quotationId,
        sub: sql<number>`coalesce(sum(${quotationItems.quantity} * ${quotationItems.unitPrice}), 0)::float8`,
      })
      .from(quotationItems)
      .where(inArray(quotationItems.quotationId, quoteIds))
      .groupBy(quotationItems.quotationId);
    const totalMap = new Map(totals.map((t) => [t.qid, t.sub]));
    for (const q of rows) {
      const sub = totalMap.get(q.id) ?? 0;
      quotes[q.id] = {
        id: q.id,
        number: q.number,
        title: q.title,
        status: q.status,
        currency: q.currency,
        total: sub * (1 + q.taxRate / 100),
      };
    }
  }

  const invoiceCards: Record<string, InvoiceCard> = {};
  if (invoiceIds.length) {
    const rows = await db
      .select()
      .from(invoices)
      .where(inArray(invoices.id, invoiceIds));
    for (const inv of rows) {
      invoiceCards[inv.id] = {
        id: inv.id,
        number: inv.number,
        amount: inv.amount,
        status: inv.status,
        dueAt: inv.dueAt,
      };
    }
  }

  // Composer options (admin only).
  let attachables: {
    quotes: { id: string; number: string; title: string }[];
    invoices: { id: string; number: string; amount: number }[];
  } | null = null;
  if (user.role === "admin" && project) {
    const cq = await db
      .select({ id: quotations.id, number: quotations.number, title: quotations.title })
      .from(quotations)
      .where(eq(quotations.companyId, project.companyId))
      .orderBy(desc(quotations.createdAt));
    const ci = await db
      .select({ id: invoices.id, number: invoices.number, amount: invoices.amount })
      .from(invoices)
      .where(eq(invoices.projectId, projectId))
      .orderBy(desc(invoices.createdAt));
    attachables = { quotes: cq, invoices: ci };
  }

  return { project, messages: msgs, quotes, invoices: invoiceCards, attachables };
}

export async function getConversations(user: User) {
  const scope =
    user.role === "admin"
      ? sql`true`
      : eq(messages.companyId, user.companyId ?? "__none__");

  const rows = await db
    .select({
      msg: messages,
      projectName: projects.name,
      companyName: companies.name,
    })
    .from(messages)
    .leftJoin(projects, eq(messages.projectId, projects.id))
    .leftJoin(companies, eq(messages.companyId, companies.id))
    .where(scope)
    .orderBy(desc(messages.createdAt));

  const reads = await db
    .select()
    .from(threadReads)
    .where(eq(threadReads.userId, user.id));
  const readMap = new Map(reads.map((r) => [r.projectId, r.lastReadAt.getTime()]));

  const convs = new Map<
    string,
    {
      projectId: string;
      projectName: string | null;
      companyName: string | null;
      last: (typeof rows)[number]["msg"];
      unread: number;
    }
  >();

  for (const r of rows) {
    const pid = r.msg.projectId;
    let c = convs.get(pid);
    if (!c) {
      c = {
        projectId: pid,
        projectName: r.projectName,
        companyName: r.companyName,
        last: r.msg,
        unread: 0,
      };
      convs.set(pid, c);
    }
    const lastRead = readMap.get(pid) ?? 0;
    if (r.msg.authorRole !== user.role && r.msg.createdAt.getTime() > lastRead) {
      c.unread += 1;
    }
  }

  return [...convs.values()];
}

export async function getUnreadTotal(user: User) {
  const scope =
    user.role === "admin"
      ? sql`true`
      : eq(messages.companyId, user.companyId ?? "__none__");

  const [row] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(messages)
    .leftJoin(
      threadReads,
      and(
        eq(threadReads.projectId, messages.projectId),
        eq(threadReads.userId, user.id),
      ),
    )
    .where(
      and(
        scope,
        ne(messages.authorRole, user.role),
        sql`(${threadReads.lastReadAt} is null or ${messages.createdAt} > ${threadReads.lastReadAt})`,
      ),
    );
  return row?.c ?? 0;
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
