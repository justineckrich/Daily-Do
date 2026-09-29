# Daily-Do — Current State

**Last updated:** 2026-09-29
**Update this doc at the end of every session.**

---

## Round State

- **Last round shipped:** 0 (project foundation: docs, rules, design reference)
- **Next round ready:** 1 (app skeleton + Today page with saving)
- **Total rounds shipped:** 0

---

## What's Done

- Repo created, `main` initialized.
- Project Brief, Current State, Rules, CLAUDE.md, dev skill.
- Today page design reference (`design/today-reference.html`) with sample data.

## What's In Progress

- Justin reviewing the design reference.

## What's Still Needed

- Everything in the backlog below.

---

## Backlog (Prioritized)

### Ready to Build

**Round 1 — Skeleton + Today page**
1. Next.js + TypeScript + Tailwind app, design tokens from the reference.
2. Supabase schema (`days`, `priorities`, `meetings`, `captures`, `ideas`) and magic-link login limited to Justin's email.
3. Today page: One Thing, Top 3, Notes, all saving automatically.
4. Past days: previous/next day navigation.
5. Deploy to Netlify; installable on the phone home screen.

**Round 2 — Meetings from Google Calendar**
1. Google OAuth (read-only calendar scope), connect button in Settings.
2. Today's events shown in the Meetings section, refreshed on open.

**Round 3 — Capture + extraction**
1. Capture bar: quick thought or pasted conversation.
2. Claude API extraction into ideas (title, summary, next step).
3. Idea actions: Make Top 3, Keep, Let go. Ideas screen.

**Round 4 — Chrome extension**
1. MV3 extension: settings page for the Daily-Do URL and personal token.
2. Daily sync of Claude.ai and ChatGPT conversations since the last successful sync.
3. `/api/ingest` endpoint with token auth and de-duplication.

**Round 5 — Morning digest**
1. 6:00am scheduled function processes new captures into ideas.
2. "From yesterday's chats" section on Today.
3. Top 3 roll-over: unfinished items offered on the next day.

### Needs Decisions

- Which Google account(s) to connect. Default: the ARM account. Confirm in Round 2.
- Digest time. Default: 6:00am Eastern. Confirm Justin's time zone.

### Future Features

- Weekly review page (Full Focus style), only if the daily page proves itself first.
- Search across ideas and past notes.

---

## Known Issues

- None yet. Known risk: the extension depends on unofficial Claude.ai and ChatGPT web endpoints and will need fixes when those sites change.

---

## Session Log

| Date | Rounds | Key Milestones |
|------|--------|----------------|
| 2026-09-29 | 0 | Project defined, docs and design reference created |
