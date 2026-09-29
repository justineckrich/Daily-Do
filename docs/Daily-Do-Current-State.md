# Daily-Do — Current State

**Last updated:** 2026-09-29
**Update this doc at the end of every session.**

---

## Round State

- **Last round shipped:** 2 (app skeleton, login, Today page with saving). Built and smoke-tested locally; not yet deployed.
- **Next round ready:** 3 (meetings from Google Calendar)
- **Total rounds shipped:** 3

---

## What's Done

- Repo created, `main` initialized.
- Project Brief, Current State, Rules, CLAUDE.md, dev skill.
- Today page design reference (`design/today-reference.html`) with sample data.
- Round 1: projects grid at the top of Today; restyled to match Justin's Superlist screenshots (dark).

- Round 2: Next.js 16 app. Email sign-in (link or 6-digit code) limited to `ALLOWED_EMAIL`. Today page with projects grid (add, next step, archive, open counts), One Thing, Top 3 (with project tags), Notes, day navigation, autosave. Capture bar saves raw captures. Meetings and chat ideas show empty states. PWA manifest and icon. Schema in `supabase/migrations/0001_init.sql`.

## What's In Progress

- First deploy: run the SQL in Supabase, connect the repo to Netlify, set env vars, set Supabase auth redirect URLs.

## What's Still Needed

- Everything in the backlog below.

---

## Backlog (Prioritized)

### Ready to Build

**Round 3 — Meetings from Google Calendar**
1. Google OAuth (read-only calendar scope), connect button in Settings.
2. Today's events shown in the Meetings section, refreshed on open.

**Round 4 — Capture + extraction**
1. Capture bar: quick thought or pasted conversation.
2. Claude API extraction into ideas (title, summary, next step).
3. Idea actions: Make Top 3, Keep, Let go. Ideas screen.

**Round 5 — Chrome extension**
1. MV3 extension: settings page for the Daily-Do URL and personal token.
2. Daily sync of Claude.ai and ChatGPT conversations since the last successful sync.
3. `/api/ingest` endpoint with token auth and de-duplication.

**Round 6 — Morning digest**
1. 6:00am scheduled function processes new captures into ideas.
2. "From yesterday's chats" section on Today.
3. Top 3 roll-over: unfinished items offered on the next day.

### Needs Decisions

- Which Google account(s) to connect. Default: the ARM account. Confirm in Round 3.
- Turn off new sign-ups in Supabase after Justin's first sign-in (Authentication → Sign In / Providers).
- Digest time. Default: 6:00am Eastern. Confirm Justin's time zone.
- The real project list for the grid (the reference uses examples).

### Future Features

- Weekly review page (Full Focus style), only if the daily page proves itself first.
- Search across ideas and past notes.

---

## Known Issues

- Supabase is not reachable from the Claude Code cloud environment (egress blocked), so live database testing happens on the Netlify deploy.
- Known risk: the extension depends on unofficial Claude.ai and ChatGPT web endpoints and will need fixes when those sites change.

---

## Session Log

| Date | Rounds | Key Milestones |
|------|--------|----------------|
| 2026-09-29 | 0–2 | Project defined, docs and design reference created; projects grid and Superlist design; app skeleton with login and Today page |
