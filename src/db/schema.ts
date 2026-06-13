import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";

const uuid = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const createdAt = () =>
  integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date());

/* ----------------------------- Auth.js tables ----------------------------- */

export const users = sqliteTable("user", {
  id: uuid(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: integer("email_verified", { mode: "timestamp_ms" }),
  image: text("image"),
  // CRM extensions:
  role: text("role", { enum: ["client", "admin"] })
    .notNull()
    .default("client"),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
});

export const accounts = sqliteTable(
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

export const sessions = sqliteTable("session", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp_ms" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* -------------------------------- CRM tables ------------------------------ */

export const companies = sqliteTable("company", {
  id: uuid(),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  createdAt: createdAt(),
});

export const projects = sqliteTable("project", {
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
  status: text("status", {
    enum: ["active", "on_hold", "completed", "cancelled"],
  })
    .notNull()
    .default("active"),
  startedAt: integer("started_at", { mode: "timestamp_ms" }),
  targetDate: integer("target_date", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

export const deals = sqliteTable("deal", {
  id: uuid(),
  companyId: text("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  value: real("value").notNull().default(0),
  stage: text("stage", {
    enum: ["lead", "qualified", "proposal", "won", "lost"],
  })
    .notNull()
    .default("lead"),
  createdAt: createdAt(),
});

export const invoices = sqliteTable("invoice", {
  id: uuid(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  number: text("number").notNull(),
  amount: real("amount").notNull().default(0),
  status: text("status", {
    enum: ["draft", "sent", "paid", "overdue"],
  })
    .notNull()
    .default("draft"),
  issuedAt: integer("issued_at", { mode: "timestamp_ms" }),
  dueAt: integer("due_at", { mode: "timestamp_ms" }),
  createdAt: createdAt(),
});

export const notes = sqliteTable("note", {
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
  visibleToClient: integer("visible_to_client", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: createdAt(),
});

export const quotations = sqliteTable("quotation", {
  id: uuid(),
  companyId: text("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  dealId: text("deal_id").references(() => deals.id, { onDelete: "set null" }),
  number: text("number").notNull(),
  title: text("title").notNull(),
  status: text("status", {
    enum: ["draft", "sent", "accepted", "declined", "expired"],
  })
    .notNull()
    .default("draft"),
  // Project type to spin up when the quote is accepted.
  projectType: text("project_type", {
    enum: ["software", "web", "mobile", "marketing"],
  })
    .notNull()
    .default("web"),
  taxRate: real("tax_rate").notNull().default(0),
  terms: text("terms"),
  validUntil: integer("valid_until", { mode: "timestamp_ms" }),
  createdProjectId: text("created_project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  createdAt: createdAt(),
});

export const quotationItems = sqliteTable("quotation_item", {
  id: uuid(),
  quotationId: text("quotation_id")
    .notNull()
    .references(() => quotations.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: real("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull().default(0),
  position: integer("position").notNull().default(0),
});

export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Quotation = typeof quotations.$inferSelect;
export type QuotationItem = typeof quotationItems.$inferSelect;
