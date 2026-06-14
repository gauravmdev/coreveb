export const site = {
  name: "Coreveb",
  tagline: "AI-native software, mobile apps & digital marketing",
  description:
    "Coreveb is an AI-native product studio. We design, build, and grow digital products — pairing custom software, mobile apps, and intelligent automation with the marketing that gets them seen.",
  email: "hello@coreveb.com",
  phone: "+91 99201 62821",
  whatsapp: "919920162821",
  url: "https://coreveb.com",
  // Add your real profiles here to show them in the footer & contact page.
  socials: [] as { label: string; href: string }[],
} as const;

export const nav = [
  { label: "Services", href: "/#services" },
  { label: "AI", href: "/#ai" },
  { label: "IT Support", href: "/#managed-it" },
  { label: "Process", href: "/#process" },
  { label: "Contact", href: "/contact" },
] as const;

export const services = [
  {
    title: "AI Solutions",
    blurb:
      "Custom AI that ships — LLM-powered assistants, agents, RAG search, and automation wired straight into your product and workflows.",
    points: ["AI agents & copilots", "RAG & semantic search", "Workflow automation"],
    icon: "ai",
  },
  {
    title: "Software Development",
    blurb:
      "Custom web apps, SaaS platforms, and internal tools built on a modern, type-safe stack that scales with you.",
    points: ["Web & SaaS platforms", "APIs & integrations", "Cloud & DevOps"],
    icon: "code",
  },
  {
    title: "Mobile Apps",
    blurb:
      "Native-quality iOS and Android apps from a single codebase, with the polish users expect and the speed teams need.",
    points: ["iOS & Android", "React Native / Expo", "App Store launch"],
    icon: "device",
  },
  {
    title: "Digital Marketing",
    blurb:
      "Data-driven campaigns that turn attention into pipeline — SEO, paid media, content, and brand that compounds.",
    points: ["SEO & content", "Paid & social ads", "Brand & analytics"],
    icon: "spark",
  },
] as const;

// "Hire us instead of hiring staff" — managed IT & support offering.
export const managedSupport = {
  eyebrow: "Managed IT & Support",
  heading: "An in-house IT team is expensive. Hire ours instead.",
  body:
    "Recruiting, salaries, benefits, and payroll for a full in-house team add up fast — and you still need to cover every skill. Bring on Coreveb instead: one team that already spans the expertise you need, at a fraction of the cost, scaling up or down whenever you do.",
  features: [
    {
      icon: "code",
      title: "Software Development",
      body: "Custom web apps, SaaS, and internal tools built and maintained by senior engineers.",
    },
    {
      icon: "grid",
      title: "Integration with your infrastructure",
      body: "We plug into your existing systems, APIs, and tools — no rip-and-replace required.",
    },
    {
      icon: "ai",
      title: "AI",
      body: "Assistants, automation, and intelligent features wired into your products and workflows.",
    },
    {
      icon: "spark",
      title: "Digital Marketing",
      body: "SEO, paid media, content, and analytics that turn attention into pipeline.",
    },
    {
      icon: "search",
      title: "Bug Fixing",
      body: "Fast diagnosis and fixes for issues across your apps, sites, and integrations.",
    },
    {
      icon: "shield",
      title: "Cyber Security",
      body: "Monitoring, hardening, and best practices to keep your systems and data protected.",
    },
  ],
  benefits: [
    "A fraction of an in-house team's cost",
    "No recruitment, salaries, or payroll",
    "Senior, multi-skilled experts",
    "Scale up or down anytime",
  ],
} as const;

// Illustrative cost comparison: one full-time hire vs the Coreveb team.
export const costComparison = {
  headline: "Get 6+ skill areas for less than one in-house salary.",
  note: "Illustrative monthly figures — actual costs vary by role, seniority, and city.",
  inHouse: {
    label: "One full-time hire",
    sub: "One person, one skill set",
    rows: [
      { label: "Senior salary", value: "₹1,20,000" },
      { label: "Benefits, PF & taxes", value: "₹24,000" },
      { label: "Recruitment (amortized)", value: "₹8,000" },
      { label: "Equipment & software", value: "₹10,000" },
      { label: "Training & overhead", value: "₹8,000" },
    ],
    total: "≈ ₹1,70,000/mo",
    totalNote: "for one role",
  },
  coreveb: {
    label: "Coreveb team",
    sub: "Software, AI, marketing, security & more",
    rows: [
      { label: "Whole multi-skill team", value: "Included" },
      { label: "Recruitment & payroll", value: "₹0" },
      { label: "Equipment & tooling", value: "₹0" },
      { label: "Training & retention", value: "₹0" },
      { label: "Scale up or down", value: "Anytime" },
    ],
    total: "One flat retainer",
    totalNote: "the whole team",
  },
} as const;

// Broader catalog surfaced as a chip cloud under the core expertise.
export const itServices = [
  "Cloud & hosting",
  "DevOps & CI/CD",
  "Database management",
  "IT helpdesk",
  "Network setup",
  "Backup & recovery",
  "System migration",
  "QA & testing",
  "UI/UX design",
  "API development",
  "E-commerce",
  "CRM & ERP",
  "Workflow automation",
  "Performance tuning",
  "Server management",
  "Email & workspace",
  "Security audits",
  "Monitoring & alerts",
  "Maintenance & updates",
  "Tech consulting",
  "Mobile apps",
  "Payment integration",
  "Data & analytics",
  "Automation scripts",
] as const;

export const stats = [
  { value: "120+", label: "Products shipped" },
  { value: "40+", label: "Active clients" },
  { value: "10×", label: "Faster with AI" },
  { value: "98%", label: "Client retention" },
] as const;

export const aiCapabilities = [
  {
    icon: "chat",
    title: "Conversational AI & copilots",
    body: "In-product assistants that answer questions, draft content, and guide users in plain language.",
  },
  {
    icon: "search",
    title: "RAG & knowledge retrieval",
    body: "Answers grounded in your own docs, data, and tickets — with citations, not hallucinations.",
  },
  {
    icon: "bot",
    title: "Autonomous agents",
    body: "Multi-step agents that plan, call your tools and APIs, and complete real tasks end to end.",
  },
  {
    icon: "doc",
    title: "Document intelligence",
    body: "Extract, classify, and summarize PDFs, invoices, and contracts at scale.",
  },
  {
    icon: "chart",
    title: "Predictive analytics",
    body: "Forecasting, scoring, and recommendations tuned to your data and your KPIs.",
  },
  {
    icon: "shield",
    title: "Evals & guardrails",
    body: "Evaluation suites, guardrails, and observability so AI stays accurate, safe, and on-brand.",
  },
] as const;

export const techStack = [
  "OpenAI",
  "Claude",
  "Next.js",
  "React Native",
  "TypeScript",
  "PostgreSQL",
  "LangChain",
  "Vector DB",
  "AWS",
  "Vercel",
] as const;

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    body: "We dig into your goals, users, and market to define what's worth building — and what isn't.",
  },
  {
    step: "02",
    title: "Design",
    body: "Wireframes, prototypes, and a design system your whole team can build against with confidence.",
  },
  {
    step: "03",
    title: "Build",
    body: "AI-accelerated sprints with working software every two weeks. Fast, but never a black box.",
  },
  {
    step: "04",
    title: "Grow",
    body: "Launch, measure, and iterate — pairing engineering with marketing so the product keeps compounding.",
  },
] as const;

// NOTE: Illustrative portfolio examples — replace with your real case studies.
export const work = [
  {
    title: "Retail Operations Suite",
    category: "SaaS Platform",
    blurb:
      "Multi-store order, delivery, and settlement platform that cut manual reconciliation by 70%.",
    tag: "Software",
  },
  {
    title: "On-Demand Delivery App",
    category: "Mobile App",
    blurb:
      "Customer and driver apps with live tracking and push — 4.8★ across the app stores.",
    tag: "Mobile",
  },
  {
    title: "B2B Demand Engine",
    category: "Performance Marketing",
    blurb:
      "Paid, SEO, and content program that tripled qualified inbound in two quarters.",
    tag: "Marketing",
  },
  {
    title: "AI Support Copilot",
    category: "AI / Web App",
    blurb:
      "RAG assistant grounded in product docs that deflected 45% of support tickets.",
    tag: "AI",
  },
] as const;
