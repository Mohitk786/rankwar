# RankWar

A public, permanent, pay-to-rank leaderboard — rank is purely a function of cumulative dollars paid. Built from a
reverse-engineering blueprint of outbid.lol's mechanism (see the original report for the full product rationale).

Stack: Next.js 16 (App Router) + TypeScript, PostgreSQL + Prisma 7 (via `@prisma/adapter-pg`), Tailwind v4, Stripe
Checkout (test mode).

## Core mechanism

- Rank = cumulative dollars paid, descending. No algorithm, no votes.
- New listing minimum: $10. Raise minimum: current total + $1. Taking #1 costs current #1 + $5.
- Raising your own listing only charges the delta — you never re-pay your full total.
- Boards: All-time (`/`), rolling 24h Today (`/today`), frozen UTC-midnight Daily archive (`/daily/[date]`), and every
  Category (`/category/[slug]`) is its own board over the same payment ledger.
- No accounts, no login — a first-party visitor cookie only de-duplicates clicks and attaches a checkout to a
  browser. Ownership of a listing is enforced socially (contact the operator), not technically — see Section 6 of
  the original report for why that's an intentional trade-off, not an oversight.

## Local setup

### 1. Database

Spin up Postgres (any Postgres 14+ works; this repo was developed against a dedicated Docker container):

```bash
docker run -d --name rankwar-postgres \
  -e POSTGRES_USER=rankwar -e POSTGRES_PASSWORD=rankwar_dev_pw -e POSTGRES_DB=rankwar \
  -p 5460:5432 -v rankwar_pgdata:/var/lib/postgresql postgres:18
```

Copy `.env.example` to `.env` and point `DATABASE_URL` at it.

### 2. Install and migrate

```bash
npm install
npx prisma migrate deploy   # or: npx prisma db push (fresh/dev DB)
npx tsx prisma/seed.ts      # seeds categories + synthetic demo listings
```

### 3. Stripe (test mode)

1. Get your test-mode keys from https://dashboard.stripe.com/test/apikeys — set `STRIPE_SECRET_KEY` (starts
   `sk_test_...`) and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts `pk_test_...`, not currently required by any code
   path since checkout uses Stripe's hosted redirect, but harmless to set).
2. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
   ```
   Put the printed `whsec_...` value in `STRIPE_WEBHOOK_SECRET`. Leave `stripe listen` running in a separate
   terminal whenever you're testing checkout locally — without it, payments succeed at Stripe but never reach your
   database (that's exactly the "payment succeeded, webhook never arrived" failure mode the admin reconciliation
   view exists to catch).
3. In production, skip the CLI: register a real webhook endpoint in the Stripe Dashboard pointed at
   `https://yourdomain.com/api/webhooks/stripe`, subscribed to at least `checkout.session.completed`,
   `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`,
   `charge.refunded`, and `charge.dispute.created`, and use *that* endpoint's signing secret.

### 4. Admin access

Set `ADMIN_PASSWORD` in `.env`, then sign in at `/admin/login`. This is deliberately the only auth-gated surface in
the whole app — everything else is anonymous by design (see "Core mechanism" above).

### 5. Daily board close (cron)

`/api/cron/close-daily` freezes the previous UTC day into permanent archive rows. It's not scheduled automatically —
wire it to whatever scheduler you have (Vercel Cron, GitHub Actions, a plain crontab) to run daily just after UTC
midnight:

```bash
curl -X POST https://yourdomain.com/api/cron/close-daily \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 6. Run it

```bash
npm run dev
```

## End-to-end smoke test

`scripts/e2e-checkout-test.mjs` drives an actual Stripe test-mode payment through a headless browser (Playwright) —
useful for re-verifying the whole checkout → webhook → board-update pipeline after any change to that path:

```bash
npx playwright install chromium   # one-time
node scripts/e2e-checkout-test.mjs [domain] [amount]
```

Requires the dev server running, `stripe listen` forwarding webhooks, and real Stripe test keys configured.

## Before accepting real money

- **Terms of Service and Privacy Policy are drafts** (`/terms`, `/privacy`) written to describe what this codebase
  actually does — they have not been reviewed by a lawyer and are not calibrated to your entity, jurisdiction, or
  actual Stripe account setup. Get them reviewed before launch, especially the no-refunds clause and any
  jurisdiction-specific consumer-rights carve-outs.
- The newsletter subscribe endpoint stores subscriptions but doesn't send any email yet — wire up a real
  transactional email provider (Resend, Postmark, etc.) before advertising the digest feature.
- Rate limiting (`src/lib/abuse.ts`) is in-memory, correct for a single instance, and needs to move to Redis
  (`INCR`/`EXPIRE`) before running more than one server process.
- The admin password check is a single shared secret — fine for a solo operator, but swap for real per-user auth
  before adding a second admin.

## What's intentionally not built

Per the original report's own recommendation, this build sticks to outbid.lol's actual observed feature set rather
than the report's separate list of proposed differentiators (rank-change indicators, embeddable badges, comparison
pages, a public read-only API, time-boxed placements, etc.) — none of that is here, and none of it should be assumed
to exist.
