# Roommate App

Shared household web app: calendar, live check-in/checkout board, supply list, weather, contacts, requests, bills, and events (incl. recurring birthdays). See [README.md](README.md) for full setup steps (Supabase project creation, env vars, running locally).

**Live app:** https://roommate-app-mu.vercel.app
**Deploy:** pushing to `master` auto-deploys to Vercel (Git integration is connected). You almost never need direct Vercel access — a normal `git push` is enough to ship.

## Access varies per collaborator

GitHub, Vercel, and Supabase access are three separate, independent grants — having one doesn't imply the others. **At the start of a session, say what you personally have access to** (e.g. "I have GitHub write access and Supabase dashboard access, no Vercel login") so Claude calibrates correctly instead of guessing or assuming everyone has the same setup:
- No Vercel access → don't run `vercel` CLI commands, they'll just fail with an auth error. Not a problem: `git push` to `master` already deploys automatically.
- Have Supabase dashboard access → you can paste and run schema migration SQL yourself in the SQL Editor at supabase.com, rather than asking someone else to run it.
- No Supabase access → draft the migration SQL and hand it to a collaborator who has dashboard access to run, same as the `git push`-only workflow above.

## Stack

Vite + React 19 + TypeScript + Tailwind CSS v4, react-router-dom v7, Supabase (Postgres + Auth + Realtime) as the backend, Open-Meteo (weather + geocoding, both free/keyless).

## Architecture, in one paragraph

Multiple households can share one Supabase project. Every data table (`day_status`, `supply_items`, `contacts`, `requests`, `bills`, `events`, plus `profiles`) carries a `household_id` and is scoped by Row Level Security via a `current_household_id()` helper (looks up the caller's own household through `auth.uid()`). **All household membership mutations (create, join, address updates) go through SECURITY DEFINER RPCs** (`create_household`, `join_household`, `update_household_address`) rather than direct table writes — there's deliberately no INSERT/UPDATE policy on `households` for `authenticated`, so don't try to write to it directly; add a new RPC instead if you need a new kind of household-level mutation. Everything else (supplies, contacts, requests, bills, events) uses normal INSERT/UPDATE/DELETE RLS policies scoped to `household_id = current_household_id()`, and any member can edit/delete any other member's entries (small trusted household model) — only `day_status` and your own `profiles` row are owner-only.

## Database changes

`supabase/schema.sql` is the fresh-install script — keep it in sync with reality, but **it does not auto-run**. Schema changes on the live database happen by hand-writing a migration snippet and running it in the Supabase SQL Editor (whoever has dashboard access does this). When you change the schema, update `schema.sql` to match AND produce the equivalent `alter table ... add column if not exists ...` / `drop policy if exists ... create policy ...` style migration snippet (idempotent — safe to re-run) for whoever has DB access to apply.

## Local dev

```bash
npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — ask for these, they're not secret but aren't committed
npm run dev
npx tsc -b              # type-check before committing
```

## Conventions worth knowing

- Each feature lives under `src/features/<name>/` (hooks, forms, page) — follow the existing pattern (e.g. `src/features/requests/`) rather than inventing a new structure.
- Mobile-first Tailwind, dark-mode variants throughout (`dark:` classes) — check both when styling.
- Realtime (`postgres_changes`) is only wired up where live sync clearly matters (`profiles`, `supply_items`, `requests`); everything else refetches on mount/after mutation.
