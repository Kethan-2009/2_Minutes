# Two Minutes

An AI accountability partner for people who start things and never finish.

You set a goal, define your own weekly commitments, and check in for two
minutes a day — what you did, what you skipped, why. The AI knows what you
said last week and won't let you quietly drift.

---

## Where this is up to

Built so far:

- **Project setup** — Next.js 16 (App Router), TypeScript, Tailwind v4, Vercel-ready
- **Supabase auth** — email + password, cookie sessions, refresh in middleware
- **Sign up / log in / confirm email** — with route protection
- **Database schema** — goals, commitments, check-ins, pivots, all under row level security

Not built yet: onboarding, goal setup, the daily check-in, pivot detection,
the dashboard, the widget, notifications.

---

## Running it locally

**1. Create a Supabase project** at [supabase.com](https://supabase.com).

**2. Run the migration.** In the Supabase dashboard, open the SQL Editor and
run the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
It creates every table, the row level security policies, and the trigger that
gives each new auth user a profile.

**3. Point auth at the app.** In Supabase → Authentication → URL Configuration:

- Site URL: `http://localhost:2000`
- Redirect URLs: add `http://localhost:2000/auth/confirm` and
  `http://localhost:2000/auth/callback`

**4. Set your environment.**

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
Supabase → Project Settings → API.

**5. Go.**

```bash
npm install
npm run dev
```

Open [localhost:2000](http://localhost:2000).

> **Why 2000 and not 3000?** Port 3000 is where every other JS project in the
> world also lives, which means stale service workers and half-forgotten dev
> servers from old projects. A dedicated port gives this app its own browser
> origin and a clean slate. It's set in the `dev` and `start` scripts — change
> the `-p` flag there if you want something else, and update
> `NEXT_PUBLIC_SITE_URL` plus the Supabase redirect URLs to match.
>
> Note that `PORT` cannot be set in `.env` — the HTTP server boots before env
> files are read.

> If email confirmation is on (the Supabase default), signing up sends you to
> `/check-email` instead of straight into the app. To skip that while building,
> turn off "Confirm email" in Authentication → Sign In / Providers.

### Checks

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # production build
```

---

## How it's laid out

```
src/
  app/
    (auth)/            sign up, log in, check email — one shared shell
      actions.ts       server actions: signUp, signIn, signOut
      form-state.ts    shared form state shape
    auth/
      confirm/         email confirmation link lands here
      callback/        PKCE code exchange (magic links, future OAuth)
    today/             morning entry point (placeholder for now)
    page.tsx           landing — redirects to /today when signed in
  components/ui/       button, text field, submit button, form error
  lib/
    env.ts             environment variables, validated with a useful error
    validation.ts      shared form validation
    supabase/
      client.ts        browser client
      server.ts        server components, actions, route handlers
      session.ts       session refresh + route gating
  proxy.ts             runs on every request (Next 16's middleware)
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
