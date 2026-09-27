# Quick Start — Two Minutes Setup

## For Local Development (Testing)

### 1. Prerequisites
- Node 20+
- Supabase account (free tier is fine)
- Anthropic API key (for Claude AI responses)

### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for it to initialize (5-10 min)
3. Copy your project URL and anon key (Settings → API)

### 3. Set Up Database

1. In Supabase dashboard, go to SQL Editor
2. Copy-paste the entire contents of `supabase/migrations/0001_init.sql`
3. Run it (the SQL will create all tables, RLS policies, indexes, and triggers)

### 4. Configure Auth URLs

In Supabase → Authentication → URL Configuration:

```
Site URL:       http://localhost:3000
Redirect URLs:  http://localhost:3000/auth/callback
```

### 5. Environment Variables

```bash
cp .env.example .env.local
```

Fill in (from Supabase Settings → API):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-your-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6. Install & Run

```bash
npm install
npm run dev
```

Visit [localhost:3000](http://localhost:3000).

---

## Testing the Flow

### Sign Up → Onboarding → Dashboard → Check-in

1. **Sign up** at `/signup` with any email/password
2. **Confirm email** — in dev, email confirmation is often disabled by default in Supabase. If you get stuck at `/check-email`, go to Supabase → Authentication → Sign In / Providers and toggle "Confirm email" off temporarily.
3. **Onboarding** redirects automatically. Choose:
   - Short-term goal (e.g., "Finish my essay")
   - Or long-term goal with 3 weekly commitments (e.g., "Learn React")
4. **Dashboard** (/today) shows your goal, countdown, and a "Start check-in" button
5. **Check-in** — answer what you did, what you skipped, why. Claude responds.
6. **Change goal** — click "Change goal" on dashboard to request a pivot. Provide 3 reasons. AI approves/rejects.

---

## Deployment to Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SITE_URL=https://your-vercel-url.vercel.app`
3. Update Supabase auth URLs to point to Vercel:
   - Site URL: `https://your-vercel-url.vercel.app`
   - Redirect URLs: `https://your-vercel-url.vercel.app/auth/callback`
4. Deploy! Vercel handles `npm run build` and `npm run dev` automatically.

---

## Architecture Quick Ref

**Frontend**: Next.js 16 (App Router), TypeScript, Tailwind v4
**Database**: Supabase (Postgres with RLS)
**Auth**: Supabase Auth (email/password)
**AI**: Anthropic Claude API (check-in responses + pivot decisions)

**Key Routes**:
- `/` — landing page (redirects to `/today` if logged in)
- `/signup`, `/login`, `/check-email` — auth flow
- `/onboarding` — 5-step goal setup
- `/today` — main dashboard (protected)
- `/check-in/[goalId]` — daily accountability check-in
- `/pivot/[goalId]` — request goal change with justification

**Database Tables**:
- `profiles` — created auto for each auth user
- `goals` — user's current goal (short or long-term)
- `commitments` — weekly milestones under long-term goals
- `check_ins` — daily entries (upserted by date)
- `pivots` — goal change requests with AI decision

All tables use **row-level security**: users can only read/write their own rows.

---

## Common Issues

### "Missing required environment variables"

Make sure `.env.local` exists in the project root (not `.env` — it's git-ignored). Restart `npm run dev` after creating it.

### Email confirmation stuck at `/check-email`

In Supabase → Authentication → Sign In / Providers, disable "Confirm email" to skip for dev. Enable it again for production.

### "Failed to create goal" when submitting onboarding

Check that your Supabase credentials are correct and your database has run the migration SQL.

### AI responses not working

- Ensure `NEXT_PUBLIC_ANTHROPIC_API_KEY` is set in `.env.local`
- Test your API key at [console.anthropic.com](https://console.anthropic.com)
- The app has a fallback response if the API is unavailable

---

## Next Steps (Not Yet Built)

- Push notifications (Firebase Cloud Messaging)
- Weekly commitment tracking on dashboard
- Lock screen widget showing today's commitments
- Settings page (edit profile, notification preferences)
- Privacy policy & T&C pages
- Goal history (view past goals, completions)
- Multiple concurrent goals support
