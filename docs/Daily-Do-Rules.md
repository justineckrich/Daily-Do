# Daily-Do — Rules & Constitution

## Sacred Rules (violate none)

1. Never delete the database, drop tables, or run destructive migrations without Justin's explicit OK in that session.
2. Work only on the designated working branch; changes reach `main` through a PR.
3. Make targeted edits on files over 300 lines. No full rewrites.
4. Every commit is titled `Round N: <summary>`.
5. At most 5 items per round.
6. Round numbers are sequential. Never reuse one.
7. Do not re-propose parked items (below) unless Justin brings them up.
8. Do not revert locked decisions (see Project Brief) without instruction.
9. Never commit secrets. API keys, OAuth secrets and tokens live in Netlify environment variables.
10. Lean rule: nothing new goes on the Today page without Justin asking for it.

## Locked Architecture Decisions

See "Locked Decisions" in [Daily-Do-Project-Brief.md](Daily-Do-Project-Brief.md). Summary:

- Single user, phone-first PWA.
- Next.js + TypeScript + Tailwind, Supabase, Netlify.
- Google Calendar read-only.
- AI chat capture by Chrome extension + 6am digest. No server-side scraping, no stored Claude/ChatGPT passwords.
- Claude API for extraction.
- Superlist-inspired design from `design/today-reference.html`, with the projects grid at the top of Today.

## Deferred / Parked Roadmap

Considered and set aside to keep Daily-Do lean. Do not re-propose unless Justin brings them up.

- Fort Work's Rocks, Projects, Habits, Speed Triage, Side Panel, and Unpack screens. (The projects grid on Today is a lightweight overview, not Fort Work's Projects screen.)
- Team features, sharing, assigning tasks to others.
- Full task manager (lists, tags, due dates beyond today).
- Native iOS/Android apps.
- Server-side scraping of Claude.ai or ChatGPT.
