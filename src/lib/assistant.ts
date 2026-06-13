// Built-in knowledge base for the in-app AI assistant.
// No external LLM — answers are matched from curated entries below, scoped by
// audience (client portal vs admin). Structured so a real model can be dropped
// in later (feed these entries as grounding context).

export type Audience = "client" | "admin";

export type KbEntry = {
  id: string;
  /** Who should see this entry. "all" shows in both portal and admin. */
  audience: Audience | "all";
  category: string;
  question: string;
  /** Extra terms that should match this entry beyond the question text. */
  keywords: string[];
  /** Answer body. Blank lines separate paragraphs; "- " lines render as bullets. */
  answer: string;
  /** ids of related entries surfaced as follow-up chips. */
  related?: string[];
};

export const KB: KbEntry[] = [
  // ---- Shared: what the app is -------------------------------------------
  {
    id: "what-is-coreveb",
    audience: "all",
    category: "Getting started",
    question: "What is Coreveb and what does this app do?",
    keywords: ["coreveb", "what is", "about", "platform", "overview", "purpose", "do"],
    answer:
      "Coreveb builds software, mobile apps, and runs digital marketing. This app is the workspace that connects you with us end to end.\n\nIn one place you can:\n- Track each project through clear stages\n- Review and accept quotations\n- Pay invoices tied to project milestones\n- Message us with quotes, invoices, and approvals built right into the conversation\n\nClients see their own projects and billing; our team uses the admin side to run the whole pipeline.",
    related: ["project-stages", "messaging-overview", "quote-to-project"],
  },

  // ---- Projects & stages -------------------------------------------------
  {
    id: "project-stages",
    audience: "all",
    category: "Projects",
    question: "How do project stages and progress work?",
    keywords: ["stage", "stages", "progress", "timeline", "status", "phase", "step", "milestone progress", "track"],
    answer:
      "Every project moves through an ordered set of stages, shown as a timeline. The highlighted stage is where the work is right now, and everything before it is complete.\n\nTypical flow: Discovery → Design → Build → Review → Launch (the exact stages depend on whether it's a software, web, mobile, or marketing project).\n\nWhen a stage needs your input, the project is marked \"awaiting approval\" and you'll be asked to sign off before it advances.",
    related: ["awaiting-approval", "project-types", "stage-billing"],
  },
  {
    id: "project-types",
    audience: "all",
    category: "Projects",
    question: "What types of projects are there?",
    keywords: ["type", "types", "software", "web", "mobile", "marketing", "category", "kind"],
    answer:
      "There are four project types, each with its own stage flow:\n- Software — custom platforms and internal tools\n- Web App — websites and web applications\n- Mobile App — iOS and Android apps\n- Marketing — campaigns, SEO, and growth work\n\nThe type is set when a quotation is accepted and the project is created.",
    related: ["project-stages", "quote-to-project"],
  },
  {
    id: "awaiting-approval",
    audience: "client",
    category: "Projects",
    question: "What does \"awaiting approval\" mean and how do I sign off a stage?",
    keywords: ["approval", "approve", "sign off", "signoff", "awaiting", "review", "accept stage", "confirm"],
    answer:
      "\"Awaiting approval\" means a stage is finished and we need your go-ahead before starting the next one.\n\nYou'll see an approval card in your Messages thread (and the project shows the awaiting state). Open it and click Approve to advance the project, or reply in the thread if you want changes first.",
    related: ["project-stages", "messaging-actionable"],
  },
  {
    id: "find-my-projects",
    audience: "client",
    category: "Projects",
    question: "Where do I see my projects and their progress?",
    keywords: [
      "find project", "my projects", "see project", "where project", "view project",
      "project list", "dashboard", "overview", "progress", "current stage",
    ],
    answer:
      "Your Overview lists every project we're running for you. Click one to open its stage timeline, where the highlighted stage shows exactly where the work is right now and what's already done.\n\nIf a project needs something from you, it's flagged as awaiting approval and you'll also get an approval card in Messages.",
    related: ["project-stages", "awaiting-approval", "request-changes"],
  },
  {
    id: "request-changes",
    audience: "client",
    category: "Projects",
    question: "Can I request changes or revisions?",
    keywords: [
      "change", "changes", "revision", "revise", "edit", "feedback", "rework",
      "not happy", "adjust", "modify", "fix", "tweak",
    ],
    answer:
      "Yes. Just reply in your Messages thread for that project and tell us what you'd like changed — it keeps everything in one place tied to the work.\n\nIf a stage is awaiting your approval, you don't have to approve it as-is: ask for the changes first, and we'll update the work before it moves to the next stage.",
    related: ["awaiting-approval", "change-scope", "messaging-overview"],
  },
  {
    id: "advance-stage-admin",
    audience: "admin",
    category: "Projects",
    question: "How do I move a project to the next stage or request a client sign-off?",
    keywords: ["advance", "next stage", "move stage", "sign off", "approval", "progress", "request approval"],
    answer:
      "Open the project from Projects. You can advance the stage directly, or send a sign-off request to the client.\n\nSending a sign-off marks the project \"awaiting approval\" and drops an approval card into the client's Messages thread. When they approve, the project advances automatically and (if a milestone is tied to that stage) the matching invoice is raised.",
    related: ["stage-billing", "messaging-actionable", "project-stages"],
  },

  // ---- Quotations --------------------------------------------------------
  {
    id: "deal-vs-quote",
    audience: "all",
    category: "Quotations",
    question: "What's the difference between a deal and a quotation?",
    keywords: [
      "deal vs quote", "difference", "deal and quotation", "deal or quote",
      "deal quotation", "pipeline vs quote", "lead vs quote", "compare",
    ],
    answer:
      "They're two steps of turning a prospect into paid work:\n- Deal — an opportunity you track before anything is agreed: a title, estimated value (₹), contact, and a stage (Lead → … → Won/Lost). It's internal pipeline only; clients never see deals.\n- Quotation — the priced scope you send the client: line items, GST, and a total they review and Accept or Decline.\n\nHow they connect: a deal is the lead → you create a quotation (optionally linked to that deal) → when the client accepts it, a project is created automatically and the deal is effectively won.\n\nSo a deal answers \"who might buy,\" and a quotation answers \"here's the price — do you agree?\"",
    related: ["deals-pipeline", "what-is-quotation", "quote-to-project"],
  },
  {
    id: "what-is-quotation",
    audience: "all",
    category: "Quotations",
    question: "What is a quotation?",
    keywords: ["quotation", "quote", "estimate", "proposal", "pricing", "scope", "line items"],
    answer:
      "A quotation is the priced scope for a piece of work — a list of line items, a tax line (GST), and a total in INR. It's what you review before work starts.\n\nQuotes have a status: Draft, Sent, Accepted, or Declined. Once accepted, it locks in the scope and kicks off a project.",
    related: ["deal-vs-quote", "accept-quote", "quote-to-project"],
  },
  {
    id: "accept-quote",
    audience: "client",
    category: "Quotations",
    question: "How do I accept or decline a quotation?",
    keywords: ["accept", "approve quote", "decline", "reject", "sign", "agree"],
    answer:
      "Open Quotations (or the quote card in your Messages) to review the line items and total. Click Accept to approve it or Decline if it needs rework.\n\nAccepting does two things automatically: it creates your project so you can track progress, and it sets up the payment schedule. You can always message us first if something needs adjusting.",
    related: ["quote-to-project", "stage-billing", "messaging-actionable"],
  },
  {
    id: "quote-to-project",
    audience: "all",
    category: "Quotations",
    question: "What happens when a quotation is accepted?",
    keywords: ["accepted", "convert", "auto create", "project created", "after accept", "what happens"],
    answer:
      "Accepting a quotation automatically:\n- Creates a project of the quoted type, starting at the first stage\n- Sets up milestone (stage-based) billing if milestones were defined on the quote\n- Notifies our team to begin work\n\nNo invoice is raised for the full amount up front — billing follows the milestone schedule.",
    related: ["stage-billing", "project-stages", "accept-quote"],
  },
  {
    id: "create-quote-admin",
    audience: "admin",
    category: "Quotations",
    question: "How do I create and send a quotation?",
    keywords: ["create quote", "new quotation", "make quote", "send quote", "add items", "draft"],
    answer:
      "Go to Quotations and click \"New quotation\" — a slide-over opens. Pick the client, give it a title, choose the project type that will be created on accept, set the tax %, and (optionally) link a deal.\n\nAfter creating it you'll land on the quote detail page to add line items and milestones, then mark it Sent. The client can review and accept it from their portal.",
    related: ["stage-billing", "quote-to-project", "what-is-proposal"],
  },
  {
    id: "what-is-proposal",
    audience: "admin",
    category: "Quotations",
    question: "How do I generate a polished PDF proposal?",
    keywords: ["proposal", "pdf", "print", "document", "export", "polished", "presentation"],
    answer:
      "Each quotation has a shareable proposal view (the /proposals page) formatted like a professional document — cover, scope sections, pricing in INR with GST, and terms.\n\nOpen it and use your browser's Print → Save as PDF. The print styles are tuned so it exports cleanly without any headless-browser setup.",
    related: ["create-quote-admin", "what-is-quotation"],
  },

  // ---- Billing & invoices ------------------------------------------------
  {
    id: "stage-billing",
    audience: "all",
    category: "Billing",
    question: "How does stage-based (milestone) billing work?",
    keywords: ["milestone", "stage billing", "stage based", "payment schedule", "installment", "partial", "split payment"],
    answer:
      "Instead of one large bill, payment is split into milestones tied to project stages. Each milestone has an amount and the stage that triggers it.\n\nWhen the project reaches that stage (usually after you approve the previous one), the milestone's invoice is raised automatically. So you pay in step with progress rather than all up front.",
    related: ["what-is-invoice", "project-stages", "quote-to-project"],
  },
  {
    id: "what-is-invoice",
    audience: "all",
    category: "Billing",
    question: "How do invoices and payment statuses work?",
    keywords: ["invoice", "bill", "payment", "due", "paid", "outstanding", "overdue", "amount", "pay"],
    answer:
      "An invoice is a bill for a milestone (or a one-off charge), shown in INR with a due date.\n\nStatuses:\n- Draft — not sent yet\n- Sent — awaiting payment\n- Paid — settled\n- Overdue — past its due date\n\nClients see their invoices under Invoices; \"outstanding\" totals everything sent but not yet paid.",
    related: ["stage-billing", "pay-invoice", "currency"],
  },
  {
    id: "pay-invoice",
    audience: "client",
    category: "Billing",
    question: "How do I pay an invoice?",
    keywords: ["pay", "payment", "how to pay", "settle", "checkout"],
    answer:
      "Open Invoices to see each bill, its amount, and due date. Payment is arranged with our team — message us on the invoice and we'll confirm the method and mark it Paid once settled.\n\nYou'll always see the current status, so there's no guessing what's outstanding.",
    related: ["what-is-invoice", "messaging-overview"],
  },
  {
    id: "raise-invoice-admin",
    audience: "admin",
    category: "Billing",
    question: "How do I raise an invoice or mark one paid?",
    keywords: ["create invoice", "new invoice", "raise invoice", "mark paid", "set status", "bill client"],
    answer:
      "Go to Invoices → \"New invoice\". Pick the client, optionally link a project, set the number, amount (₹), due date, and status.\n\nMilestone invoices are raised automatically when a project hits the triggering stage, so you mostly only create one-offs here. To update one, use the status dropdown in the row and click Set — e.g. mark it Paid once payment clears.",
    related: ["stage-billing", "what-is-invoice"],
  },
  {
    id: "currency",
    audience: "all",
    category: "Billing",
    question: "What currency and tax does the app use?",
    keywords: ["currency", "inr", "rupee", "tax", "gst", "vat", "₹"],
    answer:
      "Everything is in Indian Rupees (INR, ₹) and tax is shown as GST. Amounts are formatted in the Indian numbering style. Tax rates are set per quotation.",
    related: ["what-is-invoice", "what-is-quotation"],
  },

  // ---- Messaging ---------------------------------------------------------
  {
    id: "messaging-overview",
    audience: "all",
    category: "Messaging",
    question: "How does messaging work?",
    keywords: ["message", "messaging", "chat", "thread", "talk", "contact", "communicate", "inbox", "unread"],
    answer:
      "Messages is a direct thread between you and our team — one conversation per project. The sidebar shows an unread badge when there's something new.\n\nIt's more than chat: we can attach quotes, invoices, and approval requests as interactive cards you can act on without leaving the conversation.",
    related: ["messaging-actionable", "unread-badge"],
  },
  {
    id: "messaging-actionable",
    audience: "all",
    category: "Messaging",
    question: "What are actionable message cards?",
    keywords: ["actionable", "card", "attach", "button", "inline", "approve in chat", "quote card", "invoice card"],
    answer:
      "Instead of just linking to things, the thread can carry action cards:\n- Quote card — review and Accept/Decline inline\n- Invoice card — see the amount and status at a glance\n- Approval card — sign off a project stage with one click\n\nThe action happens right there in the conversation, so nothing gets lost in a separate tab.",
    related: ["accept-quote", "awaiting-approval", "messaging-overview"],
  },
  {
    id: "unread-badge",
    audience: "all",
    category: "Messaging",
    question: "How do unread message notifications work?",
    keywords: ["unread", "badge", "notification", "new message", "count", "seen", "read"],
    answer:
      "The Messages item in the sidebar shows a count of unread messages. Opening a thread marks it read, and the badge clears. It's tracked per person, so your read state is your own.",
    related: ["messaging-overview"],
  },
  {
    id: "send-message-admin",
    audience: "admin",
    category: "Messaging",
    question: "How do I see and reply to client messages?",
    keywords: ["client message", "reply", "respond", "inbox", "where messages", "see messages"],
    answer:
      "The Messages inbox lists every client conversation with the latest snippet and unread count. Open one to reply, and use the composer to attach a quote, invoice, or stage approval as an action card the client can act on directly.",
    related: ["messaging-actionable", "advance-stage-admin"],
  },

  // ---- Admin: CRM --------------------------------------------------------
  {
    id: "deals-pipeline",
    audience: "admin",
    category: "CRM",
    question: "How do deals and the pipeline work?",
    keywords: ["deal", "deals", "pipeline", "lead", "opportunity", "stage", "won", "lost", "value"],
    answer:
      "Deals track opportunities before they become projects. Each deal has a value and a stage (Lead → … → Won/Lost). The Deals page totals your open pipeline.\n\nWhen a deal is ready to price, link it to a quotation; accepting that quote turns the opportunity into a live project.",
    related: ["deal-vs-quote", "create-quote-admin", "clients-admin"],
  },
  {
    id: "clients-admin",
    audience: "admin",
    category: "CRM",
    question: "How do I add a client and give them portal access?",
    keywords: ["client", "company", "add client", "new client", "invite", "access", "portal access"],
    answer:
      "Go to Clients → \"New client\" to create a company workspace with its contact details. Projects, quotes, and invoices get attached to that company.\n\nA person gets portal access when their account is linked to the company and they sign in with Google using the invited email.",
    related: ["deals-pipeline", "sign-in"],
  },
  {
    id: "admin-overview",
    audience: "admin",
    category: "CRM",
    question: "What's on the admin dashboard?",
    keywords: ["dashboard", "overview", "home", "admin home", "metrics", "summary", "attention"],
    answer:
      "The Overview surfaces what needs attention: active projects, open pipeline value, pending quotes, outstanding and overdue invoices, and projects awaiting client approval — each linking straight to the relevant list.",
    related: ["deals-pipeline", "stage-billing"],
  },

  // ---- Admin how-tos -----------------------------------------------------
  {
    id: "quote-build-items",
    audience: "admin",
    category: "Quotations",
    question: "How do I add line items and milestones to a quotation?",
    keywords: [
      "line item", "line items", "add items", "quote items", "milestone",
      "milestones", "add milestone", "build quote", "pricing", "quote detail",
    ],
    answer:
      "Open the quotation to reach its detail page. There you can:\n- Add line items — a description, quantity, and unit price; the subtotal, GST, and total update as you go.\n- Add milestones — an amount plus the project stage that triggers its invoice. This is what sets up stage-based billing.\n\nYou can remove any item or milestone too. Once the items look right, set the status to Sent.",
    related: ["send-quote-status", "stage-billing", "proposal-build"],
  },
  {
    id: "send-quote-status",
    audience: "admin",
    category: "Quotations",
    question: "How do I send a quote or change its status?",
    keywords: [
      "send quote", "mark sent", "status", "quote status", "draft", "sent",
      "publish quote", "make available", "change status",
    ],
    answer:
      "Use the status control on the quotation's detail page. Move it from Draft to Sent once the line items and milestones are ready — that makes it visible for the client to review and accept in their portal.\n\nYou can also mark it Accepted or Declined manually, but normally the client does that themselves, which auto-creates the project.",
    related: ["quote-build-items", "quote-accepted-admin", "quote-to-project"],
  },
  {
    id: "proposal-build",
    audience: "admin",
    category: "Quotations",
    question: "How do I build and customize the proposal document?",
    keywords: [
      "proposal", "sections", "build proposal", "customize proposal", "cover",
      "proposal section", "document", "presentation", "format proposal",
    ],
    answer:
      "On the quotation's detail page you can edit the proposal: update its meta (title, intro, terms) and add or remove proposal sections to tell the story around the pricing.\n\nWhen it's ready, open the proposal view (/proposals) — it renders as a polished document with your sections, INR pricing, and GST. Use the browser's Print → Save as PDF to share it.",
    related: ["what-is-proposal", "quote-build-items"],
  },
  {
    id: "quote-accepted-admin",
    audience: "admin",
    category: "Quotations",
    question: "How do I know when a client accepts or responds to a quote?",
    keywords: [
      "client accepted", "accepted", "responded", "notified", "know when accept",
      "declined", "response", "quote response",
    ],
    answer:
      "When a client acts on a quote, its status updates to Accepted (or Declined), and on accept a project is created automatically and shows up under Projects.\n\nThe Overview also tracks pending quotes, and any client replies arrive in Messages with an unread badge — so the dashboard and inbox are where you'll spot responses.",
    related: ["admin-overview", "send-quote-status", "send-message-admin"],
  },
  {
    id: "milestone-invoice-admin",
    audience: "admin",
    category: "Billing",
    question: "How are milestone invoices generated — automatically or manually?",
    keywords: [
      "milestone invoice", "generate invoice", "auto invoice", "trigger invoice",
      "raise milestone", "stage invoice", "manual invoice",
    ],
    answer:
      "When a project reaches a milestone's trigger stage, that milestone's invoice is raised automatically.\n\nIf you need to bill ahead of schedule, you can also generate a milestone's invoice manually from the project's detail page. Either way it lands in Invoices, where you set it Paid once payment clears.",
    related: ["stage-billing", "raise-invoice-admin", "manage-project-admin"],
  },
  {
    id: "manage-project-admin",
    audience: "admin",
    category: "Projects",
    question: "How do I update a project's stage or put it on hold?",
    keywords: [
      "update project", "change stage", "stage", "on hold", "pause project",
      "complete project", "cancel project", "project status", "progress",
    ],
    answer:
      "On the Projects page each project has controls to set its current stage and its status — Active, On hold, Completed, or Cancelled.\n\nFor stage sign-offs, open the project's detail page to request approval from the client (which advances it on their OK) or to generate a milestone invoice.",
    related: ["advance-stage-admin", "milestone-invoice-admin", "create-project-admin"],
  },
  {
    id: "create-project-admin",
    audience: "admin",
    category: "Projects",
    question: "Can I create a project without a quotation?",
    keywords: [
      "create project", "new project", "add project", "manual project",
      "without quote", "start project", "make project",
    ],
    answer:
      "Yes. Projects are usually created automatically when a client accepts a quotation, but you can also create one directly from a client's profile page (Clients → open the client) — pick the type and it starts at the first stage.\n\nUse the quote route when there's pricing to agree; create directly for work that's already settled.",
    related: ["client-profile-admin", "quote-to-project", "manage-project-admin"],
  },
  {
    id: "client-profile-admin",
    audience: "admin",
    category: "CRM",
    question: "What can I do from a client's profile page?",
    keywords: [
      "client profile", "client page", "client detail", "open client", "company page",
      "notes", "internal note", "portal access", "link user", "give access",
    ],
    answer:
      "Open a client from Clients to reach their profile, where you can:\n- Create a project for them directly\n- Add internal notes (private to your team — clients never see these)\n- Link a user account to the company, which is what gives that person portal access\n\nIt's the hub for everything tied to that company.",
    related: ["create-project-admin", "clients-admin", "data-security"],
  },
  {
    id: "move-deal-admin",
    audience: "admin",
    category: "CRM",
    question: "How do I move a deal or mark it won or lost?",
    keywords: [
      "move deal", "deal stage", "won", "lost", "advance deal", "update deal",
      "pipeline stage", "close deal", "mark won",
    ],
    answer:
      "On the Deals page, use the stage control on each deal to move it along (Lead → … → Won/Lost) — the open-pipeline total updates as deals change stage.\n\nWhen a deal is ready to price, link it to a new quotation; the client accepting that quote is what effectively closes it as Won and spins up the project.",
    related: ["deals-pipeline", "deal-vs-quote", "create-quote-admin"],
  },
  {
    id: "attach-in-message-admin",
    audience: "admin",
    category: "Messaging",
    question: "How do I attach a quote, invoice, or approval to a message?",
    keywords: [
      "attach", "action card", "send quote in chat", "attach invoice", "approval card",
      "composer", "inline", "attach approval", "send card",
    ],
    answer:
      "In a client's Messages thread, the composer lets you attach a quote, an invoice, or a stage-approval request as an action card right in the conversation.\n\nThe client can then act on it inline — accept the quote, view the invoice, or approve the stage — without hunting through separate pages.",
    related: ["send-message-admin", "messaging-actionable", "advance-stage-admin"],
  },

  // ---- Working with us ---------------------------------------------------
  {
    id: "project-timeline",
    audience: "all",
    category: "Working with us",
    question: "How long will my project take and how do I know what's next?",
    keywords: [
      "how long", "timeline", "duration", "deadline", "eta", "when done",
      "when finished", "delivery date", "schedule", "next step", "what's next",
      "time", "estimate time",
    ],
    answer:
      "Timelines depend on the scope agreed in your quotation, so they vary by project. The clearest live picture is the stage timeline on your project — the highlighted stage is the current work and the stages after it are what's coming up.\n\nFor specific dates or an ETA on the current stage, just ask in your Messages thread and we'll confirm.",
    related: ["project-stages", "get-support", "scope-agreed"],
  },
  {
    id: "get-support",
    audience: "client",
    category: "Working with us",
    question: "How do I get help or contact your team?",
    keywords: [
      "support", "help", "contact", "reach", "talk to", "speak", "question",
      "assistance", "get in touch", "someone", "human",
    ],
    answer:
      "Your Messages thread is the direct line to us — send a message there any time and it stays tied to your project so nothing gets lost.\n\nFor quick \"how does this work\" questions, this AI Help page has you covered. For anything about your specific project, billing, or a change, message the team.",
    related: ["messaging-overview", "request-changes", "notifications"],
  },
  {
    id: "change-scope",
    audience: "client",
    category: "Working with us",
    question: "Can I add work or expand the scope mid-project?",
    keywords: [
      "add work", "extra", "expand", "more features", "additional", "new scope",
      "scope change", "add scope", "increase", "out of scope", "extend",
    ],
    answer:
      "Absolutely. Tell us what you'd like to add in your Messages thread and we'll send a new quotation covering just the additional work.\n\nOnce you accept it, that scope is added and billed alongside your existing project — so the original agreement stays clear and the new work is priced separately.",
    related: ["request-changes", "what-is-quotation", "stage-billing"],
  },
  {
    id: "scope-agreed",
    audience: "client",
    category: "Working with us",
    question: "Where can I see exactly what was agreed?",
    keywords: [
      "scope", "agreed", "what was agreed", "deliverables", "included", "contract",
      "terms", "what's included", "agreement", "line items",
    ],
    answer:
      "Your accepted quotation is the record of what was agreed — open Quotations to see its line items, totals, and terms. That's the scope the project is built against.\n\nIf something looks different from what you expected, message us and we'll sort it out.",
    related: ["what-is-quotation", "change-scope", "currency"],
  },
  {
    id: "after-launch",
    audience: "all",
    category: "Working with us",
    question: "What happens after my project launches?",
    keywords: [
      "after launch", "launched", "go live", "live", "maintenance", "support after",
      "warranty", "post launch", "ongoing", "finished", "complete", "handover",
    ],
    answer:
      "Launch is the final stage of the project. Once you're live, the project shows as completed and the work is handed over.\n\nAny ongoing support, maintenance, or new improvements are arranged as their own quotation — just message us about what you need after launch.",
    related: ["project-stages", "change-scope", "get-support"],
  },
  {
    id: "notifications",
    audience: "client",
    category: "Working with us",
    question: "How will I know when there's an update?",
    keywords: [
      "notification", "notify", "update", "alert", "know when", "new message",
      "informed", "told", "badge", "see updates",
    ],
    answer:
      "When we send something — a reply, a quote, an invoice, or an approval request — it shows up in your Messages thread and the Messages item in the sidebar gets an unread badge with the count.\n\nSo checking the portal (especially Messages) is the place to catch every update on your project and billing.",
    related: ["unread-badge", "messaging-actionable", "get-support"],
  },

  // ---- Account & settings ------------------------------------------------
  {
    id: "multiple-users",
    audience: "client",
    category: "Account",
    question: "Can my teammates also access the portal?",
    keywords: [
      "team", "teammate", "colleague", "multiple users", "add user", "another person",
      "invite", "share access", "more people", "staff",
    ],
    answer:
      "Yes — your company can have more than one person with portal access. Each person signs in with their own Google email, and they all see the same company workspace: your projects, quotes, and invoices.\n\nTo add someone, message us with their email and we'll invite them.",
    related: ["sign-in", "data-security", "get-support"],
  },
  {
    id: "data-security",
    audience: "all",
    category: "Account",
    question: "Is my data secure and who can see it?",
    keywords: [
      "secure", "security", "privacy", "private", "safe", "who can see", "data",
      "confidential", "protected", "access control", "other clients",
    ],
    answer:
      "Access is invite-only through Google sign-in — there's no public sign-up. You only ever see your own company's workspace: your projects, quotations, invoices, and messages.\n\nYou can't see other clients, and internal sales records (like our deals pipeline) are never visible to clients at all.",
    related: ["sign-in", "multiple-users"],
  },
  {
    id: "sign-in",
    audience: "all",
    category: "Account",
    question: "How do I sign in?",
    keywords: ["sign in", "login", "log in", "google", "access", "account", "auth"],
    answer:
      "Sign in with Google using the email you were invited with. Access is invite-only: clients see their company's workspace, and our team gets the admin side. If Google says you don't have access, the email isn't linked yet — message us and we'll add it.",
    related: ["clients-admin"],
  },
  {
    id: "theme",
    audience: "all",
    category: "Account",
    question: "How do I switch between light and dark mode?",
    keywords: ["theme", "dark", "light", "mode", "appearance", "toggle", "color"],
    answer:
      "Use the sun/moon button in the top bar to toggle light or dark mode. Your choice is remembered on this device.",
  },
  {
    id: "mobile",
    audience: "all",
    category: "Account",
    question: "Does the app work on mobile?",
    keywords: ["mobile", "phone", "responsive", "tablet", "app", "device"],
    answer:
      "Yes — the whole portal and admin are responsive. On small screens the sidebar becomes a slide-out menu and tables switch to stacked cards, so everything stays usable on a phone.",
  },
];

// Starter questions shown before the user types anything.
export const STARTERS: Record<Audience, string[]> = {
  client: [
    "How do project stages work?",
    "Can I request changes or revisions?",
    "How long will my project take?",
    "How do I accept a quotation?",
    "How does stage-based billing work?",
    "How do I pay an invoice?",
    "How do I get help or contact your team?",
  ],
  admin: [
    "What's the difference between a deal and a quotation?",
    "How do I create and send a quotation?",
    "How do I add line items and milestones to a quote?",
    "How are milestone invoices generated?",
    "How do I request a client sign-off?",
    "How do I generate a PDF proposal?",
    "How do I update a project's stage or put it on hold?",
    "How do deals and the pipeline work?",
  ],
};

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "do", "does", "how", "what", "i", "to", "of",
  "in", "on", "and", "or", "for", "my", "me", "this", "that", "it", "with",
  "can", "you", "we", "work", "works", "app", "use", "about", "where", "when",
  "which", "get", "got", "be", "as", "if",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9₹\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

export function entriesFor(audience: Audience): KbEntry[] {
  return KB.filter((e) => e.audience === "all" || e.audience === audience);
}

export function getEntry(id: string, audience: Audience): KbEntry | undefined {
  return entriesFor(audience).find((e) => e.id === id);
}

export type Match = { entry: KbEntry; score: number };

/** Score the knowledge base against a free-text query for the given audience. */
export function search(query: string, audience: Audience): Match[] {
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];
  const qSet = new Set(qTokens);

  const scored = entriesFor(audience).map((entry) => {
    const haystack = [
      ...tokenize(entry.question),
      ...entry.keywords.flatMap((k) => tokenize(k)),
      ...tokenize(entry.category),
    ];
    const hay = new Set(haystack);

    let score = 0;
    for (const t of qSet) {
      if (hay.has(t)) score += 2;
      else if ([...hay].some((h) => h.includes(t) || t.includes(h))) score += 1;
    }
    // Bonus when the query phrase appears in the question directly.
    const ql = query.toLowerCase();
    for (const kw of entry.keywords) {
      if (ql.includes(kw.toLowerCase())) score += 1.5;
    }
    return { entry, score };
  });

  return scored
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export const NO_MATCH =
  "I don't have a written answer for that yet. Try rephrasing, pick a suggested question below, or message our team directly — they'll get back to you in your thread.";
