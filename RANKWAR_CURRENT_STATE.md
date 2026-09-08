# RankWar — Current State Audit

*As of 2026-09-08. Stack: Next.js 16 (App Router, TS) · Prisma 7 + `@prisma/adapter-pg` · Postgres (Supabase, production) · Stripe Checkout (**test mode**) · Vercel.*

## A. What already works (verified end-to-end, not assumed)

- **Core mechanism**: pay-to-rank leaderboard, sorted purely by cumulative $ paid. All-time (`/`), rolling-24h Today (`/today`), frozen UTC-midnight Daily archive (`/daily/[date]`), 20 categories each as their own board (`/category/[slug]`) — one shared payment ledger underneath all of them.
- **Submission → payment → board update**: claim form → confirm modal (ToS) → Stripe Checkout → webhook → atomic listing create/raise. Verified with a real Stripe test-mode card end-to-end multiple times, including delta-only raise pricing (pay $42, raise to $100, charged only $58) and webhook-replay idempotency (no double-charge on redelivery).
- **Click tracking**: redirect via `/go/[slug]`, rate-limited per (visitor, listing), public counter only counts de-duplicated clicks.
- **Admin panel** (`/admin`, password-gated): listing search/status/category management, moderation queue, stuck-payment reconciliation that re-checks directly against Stripe.
- **SEO plumbing**: dynamic `sitemap.xml`/`robots.txt`, per-listing auto-generated FAQ copy, OG/Twitter metadata on product pages.
- **Trust pages**: Terms, Privacy, Rules, FAQ exist and accurately describe what the code actually does.
- **Deployment**: live on Vercel, Postgres on Supabase, migrations reconciled, `postinstall` fixed so builds don't silently ship a broken Prisma client.

## B. Partially implemented

- **Newsletter**: captures email + frequency, never sends anything — no ESP (Resend/Postmark/etc.) wired up.
- **"Most active categories"**: computed correctly, but meaningless at near-zero real volume.
- **Analytics**: raw DB counts only (listings/revenue/clicks on `/about` and admin). No funnel tracking, no conversion rate, no traffic-source attribution — you cannot currently answer "how many people who saw the homepage actually tried to pay."
- **Ownership**: fully anonymous by design (matches the original mechanism), but there's *no* path at all for a payer to later prove/manage their listing, and no contact email even listed anywhere for manual disputes.

## C. What is broken

Nothing, currently — two real bugs surfaced and were fixed this session (missing `postinstall` breaking every Vercel build; hardcoded `localhost` in Stripe redirect URLs sending real users to a dead link after paying). Both fixed and verified.

## D. What is missing (relative to *this* brief's goals)

1. **Any shareable "you won" moment.** No OG win-card, no share button after payment. This is the single biggest gap in the growth loop this brief cares about.
2. **A visible competitive ladder.** The only "what would it cost to move up" signal is a desktop-only hover tooltip on the homepage board. Nothing on mobile, nothing on the product page, nothing framed as "you are #7, beat #6 for ₹X."
3. **Real payment collection.** Stripe is still in test mode. Every "sale" so far is fake money. This is the actual reason monthly revenue is ₹0 — not a product problem, a configuration one.
4. **Any distribution.** Zero founders outside this build session have been contacted. A perfectly monetizable product with no visitors converts nothing.
5. **Company identity.** No name, no contact email/handle anywhere on the site — a real trust gap for something asking strangers for money.

## E. What is dangerous

- Terms/Privacy are drafts, not lawyer-reviewed. Fine pre-launch, a real liability once real money moves.
- No alerting on webhook failures beyond manually opening the admin reconciliation view — a silent failure could sit for days unnoticed.
- Single shared admin password, no audit trail of who changed what. Acceptable for a solo operator; would not scale past one person.

## F. What prevents monetization (in order)

1. **Stripe is in test mode.** Nothing else on this list matters until this is fixed.
2. **Zero distribution** — no visitors, no conversions, regardless of how good the product is.
3. **No shareable win moment** — the highest-leverage unbuilt growth mechanic.
4. **Dollar-denominated pricing with a $10 floor** creates real friction if the target market is India-first (see positioning recommendation).
5. **No re-engagement mechanic** — nobody finds out they've been outranked, so the single strongest repeat-purchase trigger (loss aversion) currently goes untriggered.

## G. What prevents growth

1. Zero real listings beyond this session's own tests — an empty-feeling board has no social proof, and social proof is most of what makes a stranger pay.
2. No outreach has happened yet.
3. No artifact exists for a payer to post publicly.
4. Generic, global, un-differentiated positioning — competes head-on against the original (outbid.lol) and its already-established copycats with no distinct reason to choose RankWar.

## H. What prevents trust

1. No visible company/founder identity or contact method.
2. Legal pages read exactly as what they are: templates.
3. No real testimonials or social proof yet (correctly — none exist), but the About page currently has nothing in their place at all.

## I. What is unnecessary right now

- `@supabase/supabase-js` and `@supabase/ssr` are installed as dependencies and imported by nothing in the codebase — pure dead weight from an earlier false start, safe to remove.
- Any further visual/UI polish. The design already cleared the bar that matters at zero distribution — more polish right now is P3, not P0.
