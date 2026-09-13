# Two Minutes

An AI accountability partner for people who start things and never finish.

You set a goal, define your own weekly commitments, and check in for two
minutes a day — what you did, what you skipped, why. The AI knows what you
said last week and won't let you quietly drift.

---

## Where this is up to

Built so far:

- **Project setup** — Next.js 16 (App Router), TypeScript, Tailwind v4, Vercel-ready
- **Supabase auth** — email + password, cookie sessions, refresh in the proxy
- **Sign up / log in / confirm email / password reset** — with route protection
- **Preview mode** — the UI runs with no Supabase project attached, in dev only
- **Database schema** — goals, commitments, check-ins, pivots, all under row
  level security, with TypeScript types that match
- **Error and not-found pages** — styled, rather than Next's defaults
- **Tests** — 28 unit, 28 end-to-end across mobile and desktop
- **CI** — typecheck, lint, unit tests, build and E2E on every push

Not built yet: onboarding, goal setup, the daily check-in, pivot detection,
the dashboard, the widget, notifications.

---

## Running it locally

You need Node 20+ (`node -v`) and the repo on your machine:

```bash
git clone https://github.com/Kethan-2009/2_Minutes.git
cd 2_Minutes
git checkout Pilot
npm install
npm run dev
```

Open [localhost:2000](http://localhost:2000).

That works with no configuration at all — the app starts in **preview mode**
and you can click through every screen. Sign up and log in won't do anything
yet; a black banner at the top says so, and submitting a form tells you exactly
which keys are missing.

> **Why 2000 and not 3000?** Port 3000 is where every other JS project in the
> world also lives, which means stale service workers and half-forgotten dev
> servers from old projects. A dedicated port gives this app its own browser
> origin and a clean slate. It's set in the `dev` and `start` scripts — change
> the `-p` flag there if you want something else, and update
> `NEXT_PUBLIC_SITE_URL` plus the Supabase redirect URLs to match.
>
> Note that `PORT` cannot be set in `.env` — the HTTP server boots before env
> files are read.

### Connecting Supabase

Preview mode is for looking at the interface. To actually create an account:

**1. Create a Supabase project** at [supabase.com](https://supabase.com).

**2. Run the migrations.** In the Supabase dashboard, open the SQL Editor and
run each file in [`supabase/migrations/`](supabase/migrations/) **in filename
order**. They create every table, the row level security policies, and the
trigger that gives each new auth user a profile.

**3. Point auth at the app.** In Supabase → Authentication → URL Configuration:

- Site URL: `http://localhost:2000`
- Redirect URLs: add `http://localhost:2000/auth/confirm` and
  `http://localhost:2000/auth/callback`

Password reset uses the same `/auth/confirm` route with `?next=/reset-password`,
so no extra entry is needed.

**4. Set your environment.**

```bash
cp .env.example .env.local        # Windows: copy .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
Supabase → Project Settings → API, then **restart the dev server**. The banner
disappears and auth works.

> If email confirmation is on (the Supabase default), signing up sends you to
> `/check-email` instead of straight into the app. To skip that while building,
> turn off "Confirm email" in Authentication → Sign In / Providers.

### Preview mode, precisely

Preview mode engages **only** when `NODE_ENV` is `development` and the Supabase
keys are absent. It is not a fallback that can follow you to production:

- `next build` **refuses to run** in production without both keys (see
  `next.config.ts`), so a missing variable fails the deploy rather than 500ing
  on first request.
- In preview mode the proxy skips session handling, the pages that read a
  session use a placeholder, and both auth actions return a message naming the
  missing variables.
- Form validation still runs, so that part of the UI is real.

### Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm test            # vitest — pure logic
npm run test:e2e    # playwright — real browser, mobile + desktop
npm run build       # production build
```

All of these run in CI on every push (`.github/workflows/ci.yml`).

**Unit tests** cover the parts where a quiet mistake is expensive: `safeRedirect`
(an open redirect in the login form), `humanizeAuthError` (leaking an internal
error, or confirming which emails are registered), and form validation.

**End-to-end tests** run against preview mode, so they need no Supabase project
and no secrets — which is what lets them run on every pull request. They cover
routing, the not-found page, field-level error semantics, and that a submit in
preview mode names the missing keys. Flows needing a real session (logging in,
completing a password reset) are not covered and would need a test project.

Playwright normally uses the Chromium it downloads with
`npx playwright install chromium`. If your environment already has one, point at
it instead:

```bash
PLAYWRIGHT_CHROMIUM_PATH=/path/to/chrome npm run test:e2e
```

---

## How it's laid out

```
src/
  app/
    (auth)/            sign up, log in, reset password — one shared shell
      actions.ts       server actions for every auth transition
      form-state.ts    shared form state shape
    auth/
      confirm/         email confirmation link lands here
      callback/        PKCE code exchange (magic links, future OAuth)
    today/             morning entry point (placeholder for now)
    page.tsx           landing — redirects to /today when signed in
    error.tsx          segment error boundary
    global-error.tsx   root failure; renders its own document
    not-found.tsx      404
  components/
    ui/                button, text field, submit button, form error
    setup-banner.tsx   preview-mode notice, dev only
    wordmark.tsx       the product name, set plainly
  lib/
    env.ts             env vars + preview-mode detection
    validation.ts      shared form validation
    safe-redirect.ts   narrows ?next= to a same-origin path
    auth-errors.ts     Supabase error strings → plain English
    supabase/
      client.ts        browser client
      server.ts        server components, actions, route handlers
      session.ts       session refresh + route gating
      database.types.ts  schema types (hand-maintained — see the file)
  proxy.ts             runs on every request (Next 16's middleware)
tests/
  unit/                vitest
  e2e/                 playwright
supabase/migrations/   SQL, run in order
```

**Route protection** lives in `src/lib/supabase/session.ts`. Everything is
private except `/`, `/login`, `/signup`, `/check-email` and `/auth/*`. Signed-out
visitors get bounced to `/login?next=...` and land back where they were headed.

Auth decisions always use `supabase.auth.getUser()`, which revalidates the
token with Supabase. `getSession()` only reads a cookie the client could forge,
so it is never trusted for access control.

---

## A straight answer about privacy

The intent is that what people write is theirs. What the code actually
guarantees today:

- **Row level security on every table.** Policies are owner-only
  (`auth.uid() = user_id`). One user cannot read another's rows, and the app
  never uses the service-role key, so there is no path around RLS in the
  application.
- **No analytics on check-in content.** Nothing logs or aggregates what people
  write.
- **Encrypted at rest and in transit** by Supabase, as standard.

What it does **not** guarantee, and should not be described as though it does:
anyone holding the project's service-role key or database credentials — you, as
the operator — can read the rows. "Encrypted so the developer can't see it"
requires client-side (end-to-end) encryption, where the key never reaches the
server. That is a real option and worth deciding on deliberately, but it is a
different design, and it is not what is built here. Worth being precise about
this, since the promise made to users is the product.

---

## Design

Cash App aesthetic: stark, functional, generous with space. The palette is five
tokens — canvas, ink, muted, line, accent — defined in `src/app/globals.css`.
Light and dark both supported. Every page does one job.

## Stack

Next.js · Supabase (auth + Postgres) · Tailwind CSS · Anthropic API · Vercel
