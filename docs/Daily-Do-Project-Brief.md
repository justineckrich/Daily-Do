# Daily-Do — Project Brief

**Last updated:** 2026-09-29
**Status:** Foundation (Rounds 0–1). No app code yet.
**Repo:** https://github.com/justineckrich/Daily-Do
**Working branch:** `ccr-7c764642-nrc8x3` → PR into `main`
**Claude Code mode:** Cloud (claude.ai/code), driven from phone or desktop

---

## What This Project Is

Daily-Do is Justin's personal daily planner: a digital version of the Michael Hyatt Full Focus notebook, built for how Justin works. It is Fort Work 2.0, rebuilt lean. Fort Work was the first real build and grew heavy; Daily-Do keeps only the daily page and makes it fast.

The signature feature is automatic capture. Justin's ideas used to get stuck in his head. Now they get stuck half-finished inside Claude and ChatGPT chats. Every morning Daily-Do collects yesterday's AI conversations, pulls out the unfinished ideas and next steps, and puts them on today's page so they can be acted on, kept, or let go. The concept is inspired by Bond (bondapp.io), extended to AI chats.

One user: Justin.

---

## Architecture

### The Today page (the whole app, mostly)

In order, top to bottom:

0. **Projects** — a grid of buttons, three across, one per active project, wrapping to more rows as needed. Each shows the project name, color, and open-item count. Tapping one filters the page to that project and shows its next step. This keeps the macro view (everything in motion) on the same screen as the daily focus.
1. **One Thing** — the single most important thing today.
2. **Top 3** — three priorities. Unfinished items can roll to tomorrow.
3. **Meetings** — today's events, pulled from Google Calendar. Read-only.
4. **From yesterday's chats** — ideas extracted from yesterday's Claude and ChatGPT conversations. Each idea has three actions: **Make Top 3**, **Keep** (moves to Ideas), **Let go**.
5. **Notes** — free-form notes, typed by hand.
6. **Capture bar** — always visible at the bottom. Type or paste a thought, or paste a whole AI conversation, and it lands in Ideas.

Secondary screens (kept minimal):
- **Ideas** — everything kept or captured, searchable, each linked back to the source chat.
- **Past days** — scroll back through previous daily pages.
- **Settings** — Google connection, extension token, digest time.

### How automatic capture works

```
Chrome extension (desktop, logged in to claude.ai + chatgpt.com)
   └─ once a day (chrome.alarms, plus on browser start if missed)
      fetches yesterday's conversations from both sites
      └─ POST /api/ingest  (bearer token unique to Justin)
            └─ stored as raw captures

Scheduled function, 6:00am America/New_York (Netlify Scheduled Function)
   └─ reads yesterday's captures
      └─ Claude API extracts: idea title, one-line summary, suggested next step
            └─ ideas appear in "From yesterday's chats" on Today
```

- Neither Claude nor ChatGPT has an official API for reading chat history. The extension uses the sites' own logged-in web endpoints. These are unofficial and can change; when they do, the extension needs a fix. This is an accepted trade-off.
- The extension runs only when desktop Chrome is open. If a day is missed, it catches up on the next run (it syncs "since last successful sync", not just "yesterday").
- Manual paste into the capture bar is always available as the fallback, including from the phone.

### Data model (Postgres)

| Table | Key fields |
|---|---|
| `projects` | `id`, `name`, `color`, `position`, `status` (`active` \| `archived`), `next_step` |
| `days` | `date` (PK), `one_thing`, `one_thing_done`, `notes` |
| `priorities` | `id`, `date`, `position` (1–3), `text`, `done`, `rolled_from`, `project_id` (optional) |
| `meetings` | `id`, `date`, `google_event_id`, `starts_at`, `ends_at`, `title`, `location_or_link` (cache, refreshed from Google) |
| `captures` | `id`, `source` (`claude` \| `chatgpt` \| `manual`), `external_id` (unique per source), `title`, `raw_text`, `conversation_at`, `ingested_at`, `processed_at` |
| `ideas` | `id`, `capture_id`, `title`, `summary`, `next_step`, `status` (`new` \| `kept` \| `promoted` \| `dismissed`), `promoted_to_date`, `project_id` (optional, suggested by Claude), `created_at` |

`captures.external_id` is unique per source so re-syncing never duplicates a conversation.

---

## Locked Decisions

1. Single user. No teams, sharing, or multi-tenant features.
2. Phone-first web app, installable to the home screen (PWA). Also works on desktop.
3. Stack: Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (Postgres + auth), hosted on Netlify.
4. Login: Supabase magic link, restricted to Justin's email.
5. Calendar: Google Calendar, read-only scope, via Google OAuth. Account to connect is Justin's ARM Google account unless he says otherwise; the design allows adding a second calendar later.
6. AI chat capture: Chrome extension (Manifest V3) syncing daily, plus a 6:00am scheduled digest. No server-side scraping and no stored Claude/ChatGPT passwords.
7. Idea extraction uses the Claude API.
8. Visual direction: Superlist look, matched from Justin's screenshots (dark panels, heavy headings, red-coral accent). Personal to Justin. Not ARM brand, not the Fort Work look.
9. Lean by default. A feature must earn its place on the Today page. Anything else goes to the parked list.
10. Built by Justin + Claude in rounds (see Iteration Workflow).
11. A projects grid sits at the very top of Today, above One Thing (Justin's request, 2026-09-29).

---

## Design System

Source of truth: [`design/today-reference.html`](../design/today-reference.html). Match it.

- **Feel:** Superlist, matched from Justin's screenshots (2026-09-29). Dark, sleek, modern.
- **Colors:** near-black frame, dark navy-charcoal panel with rounded corners, lighter raised surfaces for selected items. White text, muted grey-lavender for secondary text. Superlist red-coral brand accent (checks, One Thing marker, selected-project bar, Capture button). Yellow wavy divider under the day title. Small colored chips for sources (green Claude, blue ChatGPT).
- **Type:** Plus Jakarta Sans. Extra-bold, tight headline for the day; semibold section headings with grey count badges; medium task titles; small grey meta lines with icons (date, subtasks, project).
- **Components:** projects as emoji + name list items in a 3-column grid, selected one gets a raised background and red edge bar; One Thing as a raised row with a red left bar; tasks as round thin-outline checks with a meta line; idea rows with a dashed marker and purple dot; capture as a pill with a round red send button.
- Dark-only for now, like the screenshots. A light theme can come later if wanted.

---

## Data Sources

| Source | How | Status |
|---|---|---|
| Justin (typing) | Today page inputs, capture bar | Planned — Round 1 |
| Google Calendar | Google OAuth, read-only, refreshed on open and every 15 min while open | Planned — Round 2 |
| Pasted AI conversations | Capture bar → Claude API extraction | Planned — Round 3 |
| Claude.ai + ChatGPT history | Chrome extension daily sync | Planned — Round 4 |

### Accounts and keys Justin will need to set up (when we reach each round)

- **Supabase** project (free tier is fine) — Round 1
- **Netlify** site connected to this repo — Round 1
- **Google Cloud** OAuth client for Calendar — Round 2 (Claude will walk through it)
- **Anthropic API key** — Round 3

Keys go in Netlify environment variables. Never in the repo.

---

## Specs Status

| Spec | Status |
|---|---|
| Today page layout | Done — design reference |
| Data model | Done — this brief |
| Ingest API contract | Pending — Round 4 |
| Extraction prompt | Pending — Round 3 |
| Chrome extension | Pending — Round 4 |

---

## Files in the Repo

```
README.md
CLAUDE.md                          orientation for Claude Code sessions
docs/Daily-Do-Project-Brief.md     this file
docs/Daily-Do-Current-State.md     living status, updated every session
docs/Daily-Do-Rules.md             sacred rules and parked ideas
design/today-reference.html        visual source of truth for the Today page
.claude/skills/daily-do-dev/       dev skill for Claude Code
```

---

## Current State & Backlog

See [Daily-Do-Current-State.md](Daily-Do-Current-State.md).

---

## Iteration Workflow

- Justin gives feedback in chat (phone or desktop). Claude turns it into a round using the `feedback-to-prompt-workflow` skill.
- Each round: at most 5 items, one commit titled `Round N: <summary>`, pushed to the working branch, PR into `main`.
- Claude closes each round with the `round-completion-protocol` skill and updates `Daily-Do-Current-State.md`.
- `coding-principles` applies to all code.

---

## Key Context for New Chat Sessions

- Daily-Do is Fort Work 2.0, rebuilt lean. Resist adding Fort Work's extra screens.
- The Today page is the product: Projects grid, One Thing, Top 3, Meetings, yesterday's chat ideas, Notes, capture bar.
- The killer feature is the 6am digest of yesterday's Claude and ChatGPT chats, fed by a Chrome extension.
- Stack: Next.js + Supabase + Netlify + Claude API + Google Calendar.
- Read `docs/Daily-Do-Current-State.md` for where things stand, and `docs/Daily-Do-Rules.md` before changing anything.
