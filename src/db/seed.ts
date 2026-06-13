import { sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

type Db = NodePgDatabase<typeof schema>;

const days = (n: number) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

/** Populates demo data the first time the database is empty. Idempotent. */
export async function ensureSeed(db: Db) {
  const [existing] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(schema.users);
  if (existing && existing.c > 0) return;

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@coreveb.com";

  await db
    .insert(schema.users)
    .values({ name: "Coreveb Admin", email: adminEmail, role: "admin" });

  const [company] = await db
    .insert(schema.companies)
    .values({
      name: "Northwind Apparel",
      website: "https://northwind.example",
      industry: "Retail / E-commerce",
      contactName: "Priya Shah",
      contactEmail: "priya@northwind.example",
    })
    .returning();

  await db.insert(schema.users).values({
    name: "Priya Shah",
    email: "priya@northwind.example",
    role: "client",
    companyId: company.id,
  });

  const [storefront] = await db
    .insert(schema.projects)
    .values({
      companyId: company.id,
      name: "Northwind Storefront",
      type: "web",
      description: "Headless commerce storefront with personalized merchandising.",
      stageIndex: 3,
      status: "active",
      startedAt: days(-40),
      targetDate: days(30),
    })
    .returning();

  await db.insert(schema.projects).values({
    companyId: company.id,
    name: "Northwind Mobile App",
    type: "mobile",
    description: "iOS & Android shopping app with push and loyalty.",
    stageIndex: 1,
    status: "active",
    startedAt: days(-15),
    targetDate: days(60),
  });

  const [campaign] = await db
    .insert(schema.projects)
    .values({
      companyId: company.id,
      name: "Q3 Growth Campaign",
      type: "marketing",
      description: "Paid social + SEO program to grow qualified traffic.",
      stageIndex: 4,
      status: "active",
      startedAt: days(-25),
      targetDate: days(20),
    })
    .returning();

  const [loyaltyDeal] = await db
    .insert(schema.deals)
    .values({
      companyId: company.id,
      title: "Loyalty platform build",
      contactName: "Priya Shah",
      contactEmail: "priya@northwind.example",
      value: 28000,
      stage: "proposal",
    })
    .returning();

  await db.insert(schema.deals).values([
    {
      companyId: company.id,
      title: "Inventory AI add-on",
      contactName: "Dev Mehta",
      contactEmail: "dev@northwind.example",
      value: 12000,
      stage: "qualified",
    },
    {
      title: "Brand refresh — Harbor Coffee",
      contactName: "Sam Lee",
      contactEmail: "sam@harbor.example",
      value: 8000,
      stage: "lead",
    },
  ]);

  await db.insert(schema.invoices).values([
    {
      companyId: company.id,
      projectId: storefront.id,
      number: "INV-1001",
      amount: 6000,
      status: "paid",
      issuedAt: days(-30),
      dueAt: days(-16),
    },
    {
      companyId: company.id,
      projectId: campaign.id,
      number: "INV-1002",
      amount: 3500,
      status: "overdue",
      issuedAt: days(-40),
      dueAt: days(-10),
    },
  ]);

  await db.insert(schema.notes).values([
    {
      body: "Design sign-off received — moving into build this sprint.",
      authorName: "Coreveb Admin",
      projectId: storefront.id,
      companyId: company.id,
      visibleToClient: true,
    },
    {
      body: "Strong upsell opportunity around the mobile loyalty module.",
      authorName: "Coreveb Admin",
      companyId: company.id,
      visibleToClient: false,
    },
    {
      body: "Paid social is live; click-through is trending above target.",
      authorName: "Coreveb Admin",
      projectId: campaign.id,
      companyId: company.id,
      visibleToClient: true,
    },
  ]);

  // A live quote awaiting the client's decision, with a stage-based schedule.
  const [quote] = await db
    .insert(schema.quotations)
    .values({
      companyId: company.id,
      dealId: loyaltyDeal.id,
      number: "QUO-1001",
      title: "Loyalty & Rewards Platform",
      status: "sent",
      projectType: "software",
      taxRate: 8,
      terms: "50% on acceptance, balance on launch.",
      validUntil: days(14),
    })
    .returning();

  await db.insert(schema.quotationItems).values([
    {
      quotationId: quote.id,
      description: "Discovery & solution design",
      quantity: 1,
      unitPrice: 4000,
      position: 0,
    },
    {
      quotationId: quote.id,
      description: "Platform build — points, tiers & rewards",
      quantity: 1,
      unitPrice: 18000,
      position: 1,
    },
    {
      quotationId: quote.id,
      description: "Integrations & QA",
      quantity: 1,
      unitPrice: 6000,
      position: 2,
    },
  ]);

  // Software pipeline: Discovery, Design, Build, QA, Launch, Growth.
  await db.insert(schema.milestones).values([
    {
      companyId: company.id,
      quotationId: quote.id,
      label: "Start of work (deposit)",
      amount: 9072,
      triggerStageIndex: 0,
      position: 0,
    },
    {
      companyId: company.id,
      quotationId: quote.id,
      label: "After UI/UX design",
      amount: 12096,
      triggerStageIndex: 2,
      position: 1,
    },
    {
      companyId: company.id,
      quotationId: quote.id,
      label: "Before go-live",
      amount: 9072,
      triggerStageIndex: 4,
      position: 2,
    },
  ]);
}
