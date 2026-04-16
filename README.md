# Virtura Presence

Virtura Presence is a production-minded Next.js application for honest online presence assessments, consultant-reviewed audits, and client portal delivery under the Virtura Group brand.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS + shadcn/ui primitives
- Prisma ORM
- PostgreSQL
- NextAuth credentials auth
- Resend transactional email
- React Email templates

## Fresh Clone Bootstrap

1. Clone the repository.
2. Copy `.env.example` to `.env.local`.
3. Set real PostgreSQL env vars and `NEXTAUTH_SECRET`.
4. Install dependencies:

```bash
npm install
```

5. Generate Prisma Client:

```bash
npm run db:generate
```

6. Apply migrations:

```bash
npm run db:migrate:deploy
```

7. Seed the baseline catalog:

```bash
npm run db:seed
```

8. Start the app:

```bash
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` for local development. On Vercel, add the same variables in Project Settings -> Environment Variables.

### Required for app + database

- `DATABASE_URL`
  Required locally and in production. Use the pooled PostgreSQL connection string for normal app/runtime traffic.
- `DATABASE_URL_UNPOOLED`
  Required for Prisma migrations and other direct database operations. With Vercel + Neon, use the direct non-pooled connection string.
- `APP_BASE_URL`
  Required locally. Recommended in production for the canonical Virtura Presence URL.
- `NEXTAUTH_URL`
  Usually the same as `APP_BASE_URL`.
- `NEXTAUTH_SECRET`
  Required in production. Use a long random secret for JWT/session signing.

### Operational toggles

- `ENABLE_DEMO_AUTH`
  Set to `true` only if you explicitly want demo credentials enabled.
- `SEED_DEMO_DATA`
  Set to `true` only when you intentionally want demo accounts and the sample submission dataset.
- `EMAIL_DELIVERY_MODE`
  Use `auto` for normal behavior, `log` to force local/dev logging only, or `disabled` to suppress sending.
- `NOTIFICATION_BATCH_LIMIT`
  Optional batch size for `npm run notifications:process`.

### Optional for local/demo access

- `DEMO_ADMIN_EMAIL`
- `DEMO_ADMIN_PASSWORD`
- `DEMO_CONSULTANT_EMAIL`
- `DEMO_CONSULTANT_PASSWORD`
- `DEMO_CLIENT_EMAIL`
- `DEMO_CLIENT_PASSWORD`

### Required for real transactional email

- `RESEND_API_KEY`
  Required in production if transactional email is enabled.
- `RESEND_FROM_EMAIL`
  Example: `hello@mail.virtura.us`
- `RESEND_FROM_NAME`
  Example: `Virtura Presence`
- `RESEND_REPLY_TO`
  Example: `support@virtura.us`

### Vercel + Neon provider variables

If you connect Neon through Vercel, Vercel commonly injects these as well:

- `PGHOST`
- `PGHOST_UNPOOLED`
- `PGUSER`
- `PGDATABASE`
- `PGPASSWORD`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `POSTGRES_URL_NO_SSL`
- `POSTGRES_PRISMA_URL`

Virtura Presence uses `DATABASE_URL` as the primary pooled runtime connection and `DATABASE_URL_UNPOOLED` as Prisma's direct migration path. The app also accepts `POSTGRES_PRISMA_URL` or `POSTGRES_URL` as fallbacks for runtime compatibility.

## PostgreSQL Setup

1. Provision a PostgreSQL database.
2. Set `DATABASE_URL` and `DATABASE_URL_UNPOOLED`.
3. Generate Prisma Client:

```bash
npm run db:generate
```

4. Apply migrations:

```bash
npm run db:migrate:deploy
```

5. Check migration status:

```bash
npm run db:migrate:status
```

6. Seed the database:

```bash
npm run db:seed
```

By default the seed script only loads the reusable service-plan catalog. To intentionally seed demo accounts and the sample HVAC submission, run:

```bash
$env:SEED_DEMO_DATA="true"; npm run db:seed
```

The provided demo sign-in credentials only work in one of these two cases:

- `ENABLE_DEMO_AUTH=true`, which enables the built-in demo-auth shortcut.
- You already ran migrations and then seeded demo users with `SEED_DEMO_DATA=true`.

7. Verify connectivity and baseline seed data:

```bash
npm run db:check
```

### Vercel + Neon local workflow

If Vercel is managing the Neon integration for you, the easiest local setup is to pull the project env vars directly:

```bash
vercel env pull .env.local
```

That should populate the pooled and direct Postgres values Vercel provides, including `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, and the `POSTGRES_*` compatibility variables.
Prisma CLI in this repo is configured to read `.env.local` first, so migration and seed commands can use the same pulled environment file as local app runtime.

## Local Development

Run the app:

```bash
npm run dev
```

Run validation:

```bash
npm run typecheck
npm run lint
npm run build
```

## GitHub Readiness Notes

- `.env*`, local caches, and workspace artifacts are ignored, while `.env.example` remains committed.
- The app does not use any `NEXT_PUBLIC_*` secrets, and private environment variables stay on the server.
- `postinstall` runs `prisma generate`, which keeps Vercel and fresh clones aligned with the checked-in schema.

## Resend Setup

Virtura Presence uses Resend through a small provider abstraction in `lib/email`.

### Recommended sending identity

Use a verified subdomain such as `mail.virtura.us`.

Typical DNS work inside Resend:

1. Add the domain/subdomain in Resend.
2. Add the DNS records Resend gives you for DKIM, SPF, and MX.
3. Wait for verification to complete.
4. Set `RESEND_FROM_EMAIL` to an address on that verified domain.

Official references:

- [Resend Docs](https://resend.com/docs)
- [Resend Domain Verification Guidance](https://resend.com/docs/knowledge-base/what-if-my-domain-is-not-verifying)

### Local/dev fallback behavior

- If `EMAIL_DELIVERY_MODE=log`, all transactional email work is logged locally and marked as handled without contacting Resend.
- If `EMAIL_DELIVERY_MODE=auto` and Resend env vars are present, emails are sent through Resend.
- If `EMAIL_DELIVERY_MODE=auto` and Resend env vars are missing, development falls back to local logging, while production treats delivery as misconfigured.

## Vercel Deployment

1. Push the repository to GitHub.
2. Create a PostgreSQL database with your hosted provider and copy its `DATABASE_URL`.
   For Vercel + Neon, this is usually handled by connecting the database in the Vercel dashboard.
3. In Vercel, import the GitHub repository.
4. Add production environment variables:
   `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `APP_BASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `EMAIL_DELIVERY_MODE`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `RESEND_REPLY_TO`
5. Deploy once so Vercel installs dependencies, runs `postinstall`, and builds the app.
6. Apply production migrations from a trusted terminal:

```bash
npm run db:migrate:deploy
```

7. Seed the baseline catalog:

```bash
npm run db:seed
```

8. Verify production connectivity and seed state:

```bash
npm run db:check
```

9. Process pending notification events manually until you add a scheduled job or worker:

```bash
npm run notifications:process
```

`APP_BASE_URL` and `NEXTAUTH_URL` should point to the production domain you actually want users to use. The app can fall back to Vercel-provided URLs, but explicit canonical values are safer for auth links and email links. For Prisma on Neon, the app/runtime should stay on the pooled URL while migrations use the direct unpooled URL.

## Transactional Email Flows

Current transactional templates:

- Submission confirmation / quick review delivery
- Claim-link / portal access delivery
- Email verification
- Audit published notification
- Follow-up email

Notification events are written to the database first, then processed after commit. Event processing is handled by:

- `lib/notification-delivery.tsx`
- `lib/email/client.ts`
- `emails/*`

To manually process any pending notification events:

```bash
npm run notifications:process
```

For a deployment-safe smoke test after launch:

```bash
npm run db:migrate:status
npm run db:check
npm run notifications:process
```

## Current Flow Summary

- Public presence-check submissions persist to PostgreSQL through Prisma.
- New or existing users are linked to submissions by email ownership rules.
- Clients can claim accounts and verify email addresses.
- Consultants can publish audits and queue/send follow-up states.
- Notification events log delivery attempts and provider message IDs.

## Important Notes

- Demo auth is intentionally opt-in now.
- `db:seed` only creates the service-plan catalog by default. Use `SEED_DEMO_DATA=true` if you want the demo users and sample business record too.
- The production app now fails fast with clear errors when `DATABASE_URL` or `NEXTAUTH_SECRET` is missing.
- Follow-up submission status and `FollowUp` records are kept in sync when a follow-up is marked sent.
- Internal consultant notes remain separate from client-visible audit content.
