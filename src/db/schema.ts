import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";

const uuid = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  timestamp("created_at", { withTimezone: true })
    .notNull()
    .$defaultFn(() => new Date());

/* ----------------------------- Auth.js tables ----------------------------- */

export const users = pgTable("user", {
  id: uuid(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  // CRM extensions:
  role: text("role", { enum: ["client", "admin"] })
    .notNull()
    .default("client"),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* -------------------------------- CRM tables ------------------------------ */

export const companies = pgTable("company", {
  id: uuid(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  createdAt: createdAt(),
});

export const projects = pgTable("project", {
  id: uuid(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type", {
    enum: ["software", "web", "mobile", "marketing"],
  }).notNull(),
  description: text("description"),
  stageIndex: integer("stage_index").notNull().default(0),
  // Set when the admin requests the client's sign-off on the current stage.
  awaitingApproval: boolean("awaiting_approval").notNull().default(false),
  status: text("status", {
    enum: ["active", "on_hold", "completed", "cancelled"],
  })
    .notNull()
    .default("active"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  targetDate: timestamp("target_date", { withTimezone: true }),
  createdAt: createdAt(),
});

export const deals = pgTable("deal", {
  id: uuid(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  value: doublePrecision("value").notNull().default(0),
  stage: text("stage", {
    enum: ["lead", "qualified", "proposal", "won", "lost"],
  })
    .notNull()
    .default("lead"),
  createdAt: createdAt(),
});

export const invoices = pgTable("invoice", {
  id: uuid(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  number: text("number").notNull(),
  amount: doublePrecision("amount").notNull().default(0),
  status: text("status", {
    enum: ["draft", "sent", "paid", "overdue"],
  })
    .notNull()
    .default("draft"),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  dueAt: timestamp("due_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const notes = pgTable("note", {
  id: uuid(),
  body: text("body").notNull(),
  authorId: text("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorName: text("author_name"),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  dealId: text("deal_id").references(() => deals.id, { onDelete: "cascade" }),
  visibleToClient: boolean("visible_to_client").notNull().default(false),
  createdAt: createdAt(),
});

export const quotations = pgTable("quotation", {
  id: uuid(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  dealId: text("deal_id").references(() => deals.id, { onDelete: "set null" }),
  number: text("number").notNull(),
  title: text("title").notNull(),
  // Proposal cover subtitle, e.g. "Design, development & store launch".
  subtitle: text("subtitle"),
  currency: text("currency").notNull().default("INR"),
  taxLabel: text("tax_label").notNull().default("GST"),
  status: text("status", {
    enum: ["draft", "sent", "accepted", "declined", "expired"],
  })
    .notNull()
    .default("draft"),
  projectType: text("project_type", {
    enum: ["software", "web", "mobile", "marketing"],
  })
    .notNull()
    .default("web"),
  taxRate: doublePrecision("tax_rate").notNull().default(0),
  terms: text("terms"),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdProjectId: text("created_project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

export const quotationItems = pgTable("quotation_item", {
  id: uuid(),
  quotationId: text("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull().default(1),
  unitPrice: doublePrecision("unit_price").notNull().default(0),
  position: integer("position").notNull().default(0),
});

export const milestones = pgTable("milestone", {
  id: uuid(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  quotationId: text("quotation_id").references(() => quotations.id, {
    onDelete: "set null",
  }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "cascade",
  }),
  label: text("label").notNull(),
  amount: doublePrecision("amount").notNull().default(0),
  triggerStageIndex: integer("trigger_stage_index"),
  position: integer("position").notNull().default(0),
  status: text("status", { enum: ["pending", "invoiced", "paid"] })
    .notNull()
    .default("pending"),
  invoiceId: text("invoice_id").references(() => invoices.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

/** Two-way project message thread between client and admin. */
export const messages = pgTable("message", {
  id: uuid(),
  projectId: text("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  authorId: text("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  authorName: text("author_name").notNull(),
  authorRole: text("author_role", { enum: ["client", "admin"] }).notNull(),
  body: text("body").notNull(),
  // Optional actionable attachment (quote/invoice/sign-off request).
  attachmentType: text("attachment_type", {
    enum: ["quote", "invoice", "approval"],
  }),
  attachmentId: text("attachment_id"),
  createdAt: createdAt(),
});

/** Tracks the last time a user opened a project's message thread (for unread). */
export const threadReads = pgTable(
  "thread_read",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    lastReadAt: timestamp("last_read_at", { withTimezone: true })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [primaryKey({ columns: [t.userId, t.projectId] })],
);

/** Narrative sections of a proposal (Brief, Why us, Scope, Timeline, Terms…). */
export const proposalSections = pgTable("proposal_section", {
  id: uuid(),
  quotationId: text("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
  heading: text("heading").notNull(),
  body: text("body").notNull(),
  position: integer("position").notNull().default(0),
});

/** Inbound leads from the public contact form. */
export const contactSubmissions = pgTable("contact_submission", {
  id: uuid(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  service: text("service"),
  budget: text("budget"),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "read", "archived"] })
    .notNull()
    .default("new"),
  createdAt: createdAt(),
});

export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Quotation = typeof quotations.$inferSelect;
export type QuotationItem = typeof quotationItems.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ProposalSection = typeof proposalSections.$inferSelect;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
