# Daily-Do

Justin's daily planner: projects at a glance, One Thing, Top 3, meetings, notes, and a morning digest of yesterday's Claude and ChatGPT conversations.

Project docs live in [`docs/`](docs/). The visual reference is [`design/today-reference.html`](design/today-reference.html).

## Setup

1. **Database:** in Supabase, open SQL Editor, paste `supabase/migrations/0001_init.sql`, and run it.
2. **Environment variables** (Netlify → Site configuration → Environment variables, or `.env.local` for local dev). See `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key)
   - `ALLOWED_EMAIL` (the only email allowed to sign in)
3. **Your login:** Supabase → Authentication → Users → Add user → Create new user. Use `ALLOWED_EMAIL`, pick a password, and check **Auto Confirm User**.
4. **Supabase auth URLs** (for the email-link fallback): Authentication → URL Configuration. Set Site URL to the Netlify URL and add `https://<site>.netlify.app/auth/callback` to Redirect URLs.

## Troubleshooting

If the app says "Couldn't save … permission denied", run this in the Supabase SQL Editor:

```sql
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.projects, public.days, public.priorities, public.meetings, public.captures, public.ideas to authenticated;
```

## Develop

```
npm install
npm run dev
```
