# Daily-Do

Justin's daily planner: projects at a glance, One Thing, Top 3, meetings, notes, and a morning digest of yesterday's Claude and ChatGPT conversations.

Project docs live in [`docs/`](docs/). The visual reference is [`design/today-reference.html`](design/today-reference.html).

## Setup

1. **Database:** in Supabase, open SQL Editor, paste `supabase/migrations/0001_init.sql`, and run it.
2. **Environment variables** (Netlify → Site configuration → Environment variables, or `.env.local` for local dev). See `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (the publishable key)
   - `ALLOWED_EMAIL` (the only email allowed to sign in)
3. **Supabase auth URLs:** Authentication → URL Configuration. Set Site URL to the Netlify URL and add `https://<site>.netlify.app/auth/callback` to Redirect URLs.

## Develop

```
npm install
npm run dev
```
