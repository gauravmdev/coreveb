# Coreveb — Marketing Website

Marketing site for Coreveb, a studio that builds software, mobile apps, and digital marketing.

Built with **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, and **TypeScript**. Package manager: **Bun**.

## Getting started

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `bun dev`       | Start the dev server         |
| `bun run build` | Production build             |
| `bun start`     | Serve the production build   |
| `bun run lint`  | Run ESLint                   |

## Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout: fonts, metadata, header + footer
│   ├── page.tsx            # Home (hero, services, work, process, etc.)
│   ├── contact/page.tsx    # Contact page
│   └── api/contact/route.ts# Contact form handler (logs; wire up real delivery)
├── components/
│   ├── ui.tsx              # Container, Section, Button, Eyebrow primitives
│   ├── icons.tsx           # Inline SVG icons
│   ├── site-header.tsx     # Sticky nav + mobile menu
│   ├── site-footer.tsx     # Footer
│   ├── contact-form.tsx    # Client-side contact form
│   └── sections/           # Home page sections
└── lib/
    └── site.ts             # Site copy, nav, services, work, testimonials
```

## Editing content

Most copy (services, stats, work, testimonials, contact details) lives in
[`src/lib/site.ts`](src/lib/site.ts) — edit there to update the site without
touching components.

## Client portal & CRM

Beyond the marketing site, the app includes an authenticated **client portal**
and an **admin CRM**.

- **Clients** sign in at `/login` and see `/portal`: their projects with a
  live **stage timeline** (the pipeline depends on the project type — software,
  web, mobile, or marketing), invoices, and shared updates.
- **Admins** get `/admin`: an overview plus Clients, Projects, Deals, and
  Invoices. Moving a project's stage on `/admin/projects` (or a client page)
  updates what the client sees instantly.

It also supports **quotations** with stage-based payment milestones: a quote can
carry a payment schedule (e.g. "Start of work", "After UI/UX", "Before go-live"),
and accepting it creates the project and auto-invoices each milestone as the
project reaches its trigger stage.

### Stack

- **Auth:** [Auth.js (NextAuth v5)](https://authjs.dev) — Google provider +
  a passwordless **dev login** for local use. JWT sessions.
- **Database:** **PostgreSQL** via **Drizzle ORM** + `pg`. Schema is in
  `src/db/schema.ts`; migrations live in `drizzle/`. Run `bun run db:migrate`
  to apply migrations and seed demo data (idempotent — seeds only when empty).

### Local development

```bash
bun install
bun run db:up        # start a local Postgres (docker-compose, host port 55432)
bun run db:migrate   # apply migrations + seed demo data
bun dev
```

`.env.local` already points `DATABASE_URL` at the local Postgres. Stop it with
`bun run db:down`.

### Signing in (local dev)

`AUTH_DEV_LOGIN=true` (in `.env.local`) enables email-only sign-in:

- **Admin:** `admin@coreveb.com`
- **Client:** `priya@northwind.example` (demo company "Northwind Apparel")

Any other email creates a new client account.

### Enabling real Google sign-in

1. Create OAuth credentials in the
   [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add the redirect URI `http://localhost:3000/api/auth/callback/google`
   (and your production equivalent).
3. Put the values in `.env.local`:
   ```
   AUTH_GOOGLE_ID=...
   AUTH_GOOGLE_SECRET=...
   ```
4. The "Continue with Google" button appears automatically. Set
   `AUTH_DEV_LOGIN=false` in production to disable the dev login.

### Regenerating DB migrations

After editing `src/db/schema.ts`, run `bun run db:generate` to emit a new
migration into `drizzle/`, then `bun run db:migrate` to apply it.

## Deploying (Docker / Dokploy)

The app ships a `Dockerfile` that builds with Bun and, on boot, **runs
migrations + seed, then starts Next.js** (`bun run db:migrate && bun run start`).

On your Hostinger VPS with Dokploy:

1. **Create a Postgres service** in Dokploy (or reuse an existing one). Note its
   internal connection string, e.g. `postgres://user:pass@coreveb-db:5432/coreveb`.
2. **Create an Application** from this Git repo (Dockerfile build).
3. Set environment variables on the app:
   ```
   DATABASE_URL=postgres://user:pass@<db-service>:5432/coreveb
   AUTH_SECRET=<openssl rand -base64 32>
   AUTH_TRUST_HOST=true
   ADMIN_EMAIL=you@yourdomain.com
   AUTH_DEV_LOGIN=false        # disable in production
   AUTH_GOOGLE_ID=...          # once you've set up Google OAuth
   AUTH_GOOGLE_SECRET=...
   ```
4. Point the domain at the app and deploy. Migrations run automatically on each
   deploy; because Postgres is its own service, **data survives redeploys**.

The image was verified to build and boot end-to-end (migrate → seed → serve).

## Notes

- The contact form posts to `/api/contact`, which currently validates and logs
  submissions. Wire it to email (e.g. Resend), a CRM, or a database before
  launch — see the `TODO` in `src/app/api/contact/route.ts`.
- This build of Next.js 16 exposes an experimental `unstable_instant` route
  segment config for instant client-side navigation, but it requires enabling
  the experimental `cacheComponents` mode app-wide. It's intentionally left off
  here — standard `<Link>` prefetching already keeps navigation fast. Revisit
  once the API stabilizes if you enable `cacheComponents`.
