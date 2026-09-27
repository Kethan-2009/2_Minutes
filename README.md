# Two Minutes

An AI accountability partner for ambitious students who start things and never finish them.

## Setup

### 1. Supabase Project

Create a Supabase project at [supabase.com](https://supabase.com).

In the Supabase dashboard, open SQL Editor and run the contents of `supabase/migrations/0001_init.sql`. This creates:
- `profiles`, `goals`, `commitments`, `check_ins`, `pivots` tables
- Row-level security policies (owner-only access)
- Trigger for auto-creating profiles on new auth users
- Performance indexes

### 2. Auth Configuration

In Supabase → Authentication → URL Configuration:

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

(For production, use your Vercel URL.)

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Fill in from Supabase → Project Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL` — your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon key (safe for frontend)

Also add:

- `NEXT_PUBLIC_SITE_URL=http://localhost:3000` (or your production URL)
- `NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-...` (from Anthropic console)

### 4. Install & Run

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  (auth)/              # shared auth layout
    layout.tsx
    form-state.ts
    actions.ts         # signUp, signIn, signOut server actions
    signup/page.tsx
    login/page.tsx
    check-email/page.tsx
    auth/callback/route.ts
  today/               # main dashboard (protected)
    page.tsx
  layout.tsx
  page.tsx             # landing page
  globals.css          # color tokens (5-token design system)

lib/
  env.ts               # environment variable validation
  validation.ts        # email, password, goal, commitment validators
  supabase/
    client.ts          # browser Supabase client
    server.ts          # server Supabase utilities
    session.ts         # auth utilities (getUser, requireAuth)

components/ui/
  button.tsx           # primary, secondary, ghost variants
  input.tsx            # text input with optional label + error
  textarea.tsx         # multi-line input

supabase/
  migrations/
    0001_init.sql      # full database schema + RLS

middleware.ts          # session refresh on every request
```

## Database Schema

**profiles** — created automatically for each auth user
**goals** — user's long-term or short-term goal (title, deadline, status)
**commitments** — weekly goals under a long-term goal
**check_ins** — daily entries (what did, skipped, why + AI response)
**pivots** — goal change requests (3 justifications + AI approval/rejection)

All tables have row-level security: users can only read/write their own rows.

## Design System

Five-token palette (in `app/globals.css`):

- `--canvas` — background
- `--ink` — foreground text
- `--muted` — secondary text
- `--line` — borders, dividers
- `--accent` — interactive elements (links, buttons)

Light and dark modes supported via `prefers-color-scheme` and `data-theme` attribute.

## Commands

```bash
npm run dev       # dev server
npm run build     # production build
npm run start     # run production build
npm run typecheck # tsc --noEmit
npm run lint      # ESLint
```

## Deployment

Deploy to Vercel with `npm run build`. Environment variables are set in Vercel dashboard → Project Settings → Environment Variables.

## Privacy

- **Row-level security** on every table — users can't read others' data
- **No logging** of check-in content
- **Encrypted at rest and in transit** (Supabase defaults)
- **Operator access**: you (as project owner) can read rows via service-role key, but the app never uses it

This is not end-to-end encryption (which would be a separate design). Use this if standard Supabase security is sufficient for your threat model.

## Next Steps

- [ ] Onboarding flow (goal type → duration → commitments)
- [ ] Dashboard (goal, deadline countdown, weekly progress)
- [ ] Daily check-in page with Anthropic API
- [ ] Pivot detection system
- [ ] Push notifications (Firebase Cloud Messaging)
- [ ] Lock screen widget
- [ ] Settings & privacy policy pages
