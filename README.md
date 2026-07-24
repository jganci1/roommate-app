# Roommate App

A shared web app for people living in a house together: a weekly calendar of who's around, a live check-in/checkout board, a shared supply list, local weather, common contacts, requests, and monthly bill itemization.

Everyone signs in with their own account, then creates a new household or joins an existing one with an invite code. Every roommate in the same household sees the same shared data, synced live via [Supabase](https://supabase.com) — one Supabase project can host any number of separate households, each fully isolated from the others.

**Live app:** https://roommate-app-mu.vercel.app

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account/project (pick any name/region/password — the password is only for the Postgres database, not for your roommates' logins).
2. Once the project is ready, open **Project Settings → Data API** and copy the **Project URL**.
3. Open **Project Settings → API Keys** and copy the **anon public** key.

## 2. Configure the app

Copy `.env.example` to `.env` and fill in the two values from step 1:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

`.env` is gitignored — never commit it.

## 3. Create the database tables

In your Supabase project, open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates all the tables (profiles, calendar status, supply list, contacts, requests, bills), Row Level Security policies, and enables Realtime sync for the check-in board, supply list, and requests.

## 4. Decide how roommates sign up

By default, Supabase lets anyone who finds your app's URL create an account with any email. For a household app that's usually fine (the URL isn't published anywhere), but if you want tighter control:

- Go to **Authentication → Sign In / Providers** in Supabase and turn off "Allow new users to sign up", then invite each roommate manually from **Authentication → Users → Invite user**.
- Or leave it open and just share the URL with your roommates directly.

Supabase also sends a confirmation email by default before a new signup can log in — you can turn that off under **Authentication → Sign In / Providers → Email** if you'd rather roommates log in immediately after signing up.

## 5. Run it

```bash
npm install
npm run dev
```

Open the printed local URL (e.g. `http://localhost:5173`) — each roommate signs up with their name, email, and a password, then either **creates a household** (picking a name, which generates a 6-character invite code) or **joins one** by entering a code a roommate shared with them. Each household is capped at 10 members. The invite code is always visible on the **Household** page for existing members to share.

## 6. Weather

The weather widget asks the browser for your location (a normal browser/OS permission prompt on both iPhone and Android) and pulls current conditions + a 5-day forecast from [Open-Meteo](https://open-meteo.com) — free, no API key needed. If location access is denied, the widget shows a retry option instead of local weather.

## Deployment

The app is deployed to Vercel at **https://roommate-app-mu.vercel.app** — that's the URL your roommates should use, from any phone or computer. `vercel.json` contains a rewrite rule so client-side routes (`/calendar`, `/supplies`, etc.) work on direct load/refresh, not just via in-app navigation.

`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set as environment variables in the Vercel project (Production + Preview). To ship a change: commit it, then from `roommate-app` run:

```bash
npx vercel deploy --prod --yes
```

`npm run dev` still works for local development against the same Supabase project.

## Notes on the data model

- Every table (calendar, supply list, contacts, requests, bills, and profiles) carries a `household_id` and is scoped by Row Level Security to `current_household_id()` — a signed-in user can only ever see or write their own household's data, enforced at the database level regardless of what the client sends.
- All household creation/joining goes through the `create_household()`/`join_household()` database functions rather than direct table access, so the "one household per person" rule and the 10-roommate cap can't be bypassed by calling the API directly.
- Supply items, contacts, requests, and bills can be edited or deleted by any member of the household (e.g. anyone can mark an item purchased or close someone else's request) — appropriate for a small trusted household. Calendar entries and your own check-in/checkout status can only be changed by you.
