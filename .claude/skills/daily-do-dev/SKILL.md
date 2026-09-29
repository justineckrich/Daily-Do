---
name: daily-do-dev
description: >
  Use this skill whenever working on Daily-Do, Justin's lean daily planner
  (Fort Work 2.0). Triggers on mentions of Daily-Do, the Today page, One Thing,
  Top 3, the morning digest, the capture bar, or the Chrome extension that
  syncs Claude and ChatGPT chats.
---

# Daily-Do — Development Skill

## First Thing Every Session

```
git fetch origin
git status
```
Confirm you are on the designated working branch, then read `docs/Daily-Do-Current-State.md`.

## What Is Daily-Do

A phone-first daily planner modeled on the Michael Hyatt Full Focus notebook: One Thing, Top 3, meetings from Google Calendar, notes, and a 6am digest that turns yesterday's Claude and ChatGPT conversations into ideas and next steps. Single user (Justin).

## Tech Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres + magic-link auth)
- Netlify hosting + Netlify Scheduled Functions (6am digest)
- Claude API for idea extraction
- Google Calendar API (read-only)
- Chrome extension, Manifest V3, in `extension/`

## Repo & Paths

- GitHub: https://github.com/justineckrich/Daily-Do
- Cloud clone: `/home/user/daily-do`
- Changes land on `main` via PR from the working branch

## Critical Rules

1. Never delete data or run destructive migrations without Justin's OK.
2. Rounds: max 5 items, commit `Round N: <summary>`, sequential numbers.
3. Targeted edits on files over 300 lines.
4. No secrets in the repo.
5. Nothing new on the Today page unless Justin asks.

## Current Architecture

See `docs/Daily-Do-Project-Brief.md` (Today page sections, capture flow, data model).

## Refresh Routine

After each round: push, update the PR, update `docs/Daily-Do-Current-State.md`, then give Justin the Netlify preview link to check on his phone.

## What NOT To Do

- Don't rebuild Fort Work screens (Rocks, Projects, Habits, etc.).
- Don't add boxed cards everywhere. Idea cards are the only bordered objects on Today.
- Don't scrape Claude.ai or ChatGPT from the server or store their passwords.
- Don't add libraries for things a few lines of code can do.
