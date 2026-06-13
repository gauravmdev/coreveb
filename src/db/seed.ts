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
      subtitle: "Design, development & launch — points, tiers & rewards",
      currency: "INR",
      taxLabel: "GST",
      status: "sent",
      projectType: "software",
      taxRate: 18,
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

  await db.insert(schema.proposalSections).values([
    {
      quotationId: quote.id,
      heading: "Understanding the Brief",
      body: "Northwind Apparel wants to turn one-time shoppers into repeat customers with a loyalty programme that feels effortless. Members earn points on every purchase, climb tiers, and redeem rewards — across web and mobile, tied into the existing storefront.\n\nCoreVeb will design, build, and launch the platform end to end, with a clean admin to run campaigns and a data model ready for future personalisation.",
      position: 0,
    },
    {
      quotationId: quote.id,
      heading: "Why CoreVeb",
      body: "A software & digital product studio that ships consumer-grade products end to end — design, full-stack build, launch and support — under one accountable team.\n\n## What you get\n- A single point of contact and weekly demos\n- Clean, documented, scalable code your team can own\n- Accuracy where it counts: points, tiers and redemptions engineered to be correct and auditable\n- Honest, fixed commercials with a clear milestone schedule",
      position: 1,
    },
    {
      quotationId: quote.id,
      heading: "Scope of Work",
      body: "## Design\n- UX research, user flows and information architecture\n- High-fidelity, accessible UI aligned to your brand\n- Interactive prototype and reusable component library\n\n## Build\n- Points, tiers and rewards engine with full transaction history\n- Member profiles, redemption flows and notifications\n- Secure APIs and role-based admin for campaigns and content\n\n## Launch\n- Functional testing, performance optimisation and analytics\n- Production deployment and handover with documentation",
      position: 2,
    },
    {
      quotationId: quote.id,
      heading: "Responsibilities & Terms",
      body: "## CoreVeb will\n- Reflect your requirements faithfully in design and build\n- Demo progress regularly and keep a clear record of feedback\n- Hand over full source code on completion\n\n## You will\n- Nominate a single decision-maker\n- Provide consolidated feedback within 7 working days per stage\n- Provide brand assets and content\n\n## Terms\n- 30 days of free technical support from delivery\n- Work beyond the defined scope affects the quote and timeline\n- A firm delivery date is confirmed once designs are approved",
      position: 3,
    },
  ]);
}
