"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { addDays, dayOfYear, longDate, toISODate, weekday } from "@/lib/dates";

type Project = { id: string; name: string; emoji: string; position: number; next_step: string | null };
type Priority = { position: 1 | 2 | 3; text: string; done: boolean; project_id: string | null };
type Day = { one_thing: string; one_thing_done: boolean; notes: string };
type OpenItem = { project_id: string; date: string };

const EMPTY_DAY: Day = { one_thing: "", one_thing_done: false, notes: "" };
const emptyPriorities = (): Priority[] =>
  ([1, 2, 3] as const).map((position) => ({ position, text: "", done: false, project_id: null }));

const SAVE_DELAY = 600;

export default function Today() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [date, setDate] = useState(() => toISODate(new Date()));
  const [day, setDay] = useState<Day>(EMPTY_DAY);
  const [priorities, setPriorities] = useState<Priority[]>(emptyPriorities);
  const [projects, setProjects] = useState<Project[]>([]);
  const [openItems, setOpenItems] = useState<OpenItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newEmoji, setNewEmoji] = useState("📁");
  const [newName, setNewName] = useState("");
  const [capture, setCapture] = useState("");
  const [toast, setToast] = useState("");
  const [saveState, setSaveState] = useState("");
  const [loading, setLoading] = useState(true);

  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2500);
  }, []);

  const run = useCallback(
    async (label: string, op: () => PromiseLike<{ error: { message: string } | null }>) => {
      setSaveState("Saving…");
      const { error } = await op();
      if (error) {
        setSaveState("");
        say(`Couldn't save ${label}. Check your connection and try again.`);
      } else {
        setSaveState("Saved");
      }
    },
    [say],
  );

  // Debounce writes per key so typing doesn't send a request per keystroke.
  const later = useCallback((key: string, fn: () => void) => {
    const t = timers.current.get(key);
    if (t) clearTimeout(t);
    timers.current.set(key, setTimeout(() => {
      timers.current.delete(key);
      fn();
    }, SAVE_DELAY));
  }, []);

  const openItemsQuery = useCallback(
    () =>
      supabase
        .from("priorities")
        .select("project_id, date")
        .eq("done", false)
        .not("project_id", "is", null)
        .neq("text", ""),
    [supabase],
  );

  const loadOpenItems = useCallback(async () => {
    const { data } = await openItemsQuery();
    setOpenItems((data as OpenItem[]) ?? []);
  }, [openItemsQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dayRes, priRes, projRes, openRes] = await Promise.all([
        supabase.from("days").select("one_thing, one_thing_done, notes").eq("date", date).maybeSingle(),
        supabase.from("priorities").select("position, text, done, project_id").eq("date", date),
        supabase.from("projects").select("id, name, emoji, position, next_step").eq("status", "active").order("position"),
        openItemsQuery(),
      ]);
      if (cancelled) return;
      if (dayRes.error || priRes.error || projRes.error) say("Couldn't load your day. Pull to refresh or try again.");
      setDay((dayRes.data as Day) ?? EMPTY_DAY);
      const rows = (priRes.data as Priority[]) ?? [];
      setPriorities(emptyPriorities().map((p) => rows.find((r) => r.position === p.position) ?? p));
      setProjects((projRes.data as Project[]) ?? []);
      setOpenItems((openRes.data as OpenItem[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [date, supabase, say, openItemsQuery]);

  // Days
  const updateDay = (patch: Partial<Day>, immediate = false) => {
    const next = { ...day, ...patch };
    setDay(next);
    const save = () =>
      run("your day", () => supabase.from("days").upsert({ date, ...next, updated_at: new Date().toISOString() }, { onConflict: "user_id,date" }));
    if (immediate) {
      const pending = timers.current.get(`day:${date}`);
      if (pending) clearTimeout(pending);
      save();
    } else later(`day:${date}`, save);
  };

  // Priorities
  const updatePriority = (position: number, patch: Partial<Priority>, immediate = false) => {
    const current = priorities.find((p) => p.position === position);
    if (!current) return;
    const r: Priority = { ...current, ...patch };
    setPriorities((prev) => prev.map((p) => (p.position === position ? r : p)));
    const save = () => {
      run("your Top 3", () =>
        supabase
          .from("priorities")
          .upsert(
            { date, position: r.position, text: r.text, done: r.done, project_id: r.project_id, updated_at: new Date().toISOString() },
            { onConflict: "user_id,date,position" },
          ),
      ).then(loadOpenItems);
    };
    if (immediate) {
      const pending = timers.current.get(`pri:${date}:${position}`);
      if (pending) clearTimeout(pending);
      save();
    } else later(`pri:${date}:${position}`, save);
  };

  // Projects
  const counts = useMemo(() => {
    const map = new Map<string, { open: number; today: number }>();
    for (const item of openItems) {
      const c = map.get(item.project_id) ?? { open: 0, today: 0 };
      c.open += 1;
      if (item.date === date) c.today += 1;
      map.set(item.project_id, c);
    }
    return map;
  }, [openItems, date]);

  const addProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    const position = projects.length ? Math.max(...projects.map((p) => p.position)) + 1 : 0;
    const { data, error } = await supabase
      .from("projects")
      .insert({ name, emoji: newEmoji.trim() || "📁", position })
      .select("id, name, emoji, position, next_step")
      .single();
    if (error || !data) {
      say("Couldn't add that project. Try again.");
      return;
    }
    setProjects((prev) => [...prev, data as Project]);
    setNewName("");
    setNewEmoji("📁");
    setAdding(false);
    say(`Added ${name}`);
  };

  const updateNextStep = (id: string, next_step: string) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, next_step } : p)));
    later(`proj:${id}`, () => run("the next step", () => supabase.from("projects").update({ next_step }).eq("id", id)));
  };

  const archiveProject = async (project: Project) => {
    const { error } = await supabase.from("projects").update({ status: "archived" }).eq("id", project.id);
    if (error) {
      say("Couldn't archive that project. Try again.");
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== project.id));
    setSelected(null);
    say(`Archived ${project.name}`);
  };

  // Capture
  const submitCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = capture.trim();
    if (!text) {
      say("Type or paste something to capture.");
      return;
    }
    const { error } = await supabase
      .from("captures")
      .insert({ source: "manual", raw_text: text, title: text.slice(0, 80), conversation_at: new Date().toISOString() });
    if (error) {
      say("Couldn't capture that. Try again.");
      return;
    }
    setCapture("");
    say("Captured. It'll be turned into ideas once extraction is on.");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  const todayISO = toISODate(new Date());
  const selectedProject = projects.find((p) => p.id === selected) ?? null;
  const doneCount = priorities.filter((p) => p.done && p.text.trim()).length;
  const projectName = (id: string | null) => projects.find((p) => p.id === id)?.name;

  return (
    <>
      <main className="panel" aria-busy={loading}>
        <nav aria-label="Projects">
          <p className="label">
            <span>Projects</span>
          </p>
          <div className="projects">
            {projects.map((p) => {
              const c = counts.get(p.id);
              const meta = c ? `${c.open} open${c.today ? ` · ${c.today} today` : ""}` : "Nothing open";
              return (
                <button
                  key={p.id}
                  type="button"
                  className="proj"
                  aria-pressed={selected === p.id}
                  onClick={() => setSelected(selected === p.id ? null : p.id)}
                >
                  <span className="proj-top">
                    <span className="emoji">{p.emoji}</span>
                    <span className="name">{p.name}</span>
                  </span>
                  <span className="meta">{meta}</span>
                </button>
              );
            })}
            <button type="button" className="proj add" onClick={() => setAdding((a) => !a)}>
              ＋ Add project
            </button>
          </div>

          {adding && (
            <form className="proj-form" onSubmit={addProject}>
              <input
                id="new-project-emoji"
                className="field emoji-field"
                aria-label="Project emoji"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
              />
              <input
                id="new-project-name"
                className="field name-field"
                aria-label="Project name"
                placeholder="Project name"
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button className="btn small primary" disabled={!newName.trim()}>
                Add
              </button>
            </form>
          )}

          {selectedProject && (
            <div className="peek">
              <b>{selectedProject.name}</b>
              <input
                id="project-next-step"
                className="field"
                style={{ padding: "6px 10px", fontSize: 14 }}
                placeholder="Next step for this project"
                value={selectedProject.next_step ?? ""}
                onChange={(e) => updateNextStep(selectedProject.id, e.target.value)}
              />
              <button type="button" className="link" onClick={() => archiveProject(selectedProject)}>
                Archive
              </button>
            </div>
          )}
        </nav>

        <header className="day">
          <div>
            <h1 className="title">{weekday(date)}</h1>
            <div className="sub">
              {longDate(date)} · Day {dayOfYear(date)}
            </div>
          </div>
          <div className="round-btns">
            <button type="button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))}>
              ‹
            </button>
            {date !== todayISO && (
              <button type="button" onClick={() => setDate(todayISO)}>
                Today
              </button>
            )}
            <button type="button" aria-label="Next day" onClick={() => setDate(addDays(date, 1))}>
              ›
            </button>
          </div>
        </header>
        <svg className="wave" viewBox="0 0 420 14" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M2 7 Q 9 1 16 7 T 30 7 T 44 7 T 58 7 T 72 7 T 86 7 T 100 7 T 114 7 T 128 7 T 142 7 T 156 7 T 170 7 T 184 7 T 198 7 T 212 7 T 226 7 T 240 7 T 254 7 T 268 7 T 282 7 T 296 7 T 310 7 T 324 7 T 338 7 T 352 7 T 366 7 T 380 7 T 394 7 T 408 7 T 418 7"
            fill="none"
            stroke="var(--wave)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>

        <div className="one">
          <div className="kicker">One Thing</div>
          <div className={`task${day.one_thing_done ? " is-done" : ""}`}>
            <button
              type="button"
              className="check"
              aria-pressed={day.one_thing_done}
              aria-label="Mark One Thing done"
              onClick={() => updateDay({ one_thing_done: !day.one_thing_done }, true)}
            />
            <div className="body">
              <input
                id="one-thing"
                className="text"
                aria-label="One Thing"
                placeholder="What's the one thing that matters most today?"
                value={day.one_thing}
                onChange={(e) => updateDay({ one_thing: e.target.value })}
              />
            </div>
          </div>
        </div>

        <section>
          <h2>
            Top 3 <span className="count">{doneCount}/3</span>
          </h2>
          {priorities.map((p) => {
            const dim = selected && p.project_id !== selected;
            return (
              <div key={p.position} className={`task${p.done ? " is-done" : ""}`} style={{ opacity: dim ? 0.35 : 1 }}>
                <button
                  type="button"
                  className="check"
                  aria-pressed={p.done}
                  aria-label={`Mark priority ${p.position} done`}
                  onClick={() => updatePriority(p.position, { done: !p.done }, true)}
                />
                <div className="body">
                  <input
                    id={`top-${p.position}`}
                    className="text"
                    aria-label={`Priority ${p.position}`}
                    placeholder={`Priority ${p.position}`}
                    value={p.text}
                    onChange={(e) => updatePriority(p.position, { text: e.target.value })}
                  />
                  {projects.length > 0 && (
                    <div className="meta-row">
                      <label>
                        <svg className="i" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M4 7h16M4 12h16M4 17h10" />
                        </svg>
                        <select
                          id={`top-${p.position}-project`}
                          aria-label={`Project for priority ${p.position}`}
                          value={p.project_id ?? ""}
                          onChange={(e) => updatePriority(p.position, { project_id: e.target.value || null }, true)}
                        >
                          <option value="">{projectName(p.project_id) ? "No project" : "Add to a project"}</option>
                          {projects.map((proj) => (
                            <option key={proj.id} value={proj.id}>
                              {proj.emoji} {proj.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <section>
          <h2>
            Meetings <span className="note">Google Calendar</span>
          </h2>
          <p className="empty">Your calendar connects in the next round. Today&apos;s meetings will show here.</p>
        </section>

        <section>
          <h2>From yesterday&apos;s chats</h2>
          <p className="empty">
            Once the Chrome extension is on, ideas from yesterday&apos;s Claude and ChatGPT chats land here every morning.
          </p>
        </section>

        <section>
          <h2>Notes</h2>
          <textarea
            id="notes"
            className="notes"
            aria-label="Notes"
            placeholder="Type notes for today…"
            value={day.notes}
            onChange={(e) => updateDay({ notes: e.target.value })}
          />
        </section>

        <div className="save-state" aria-live="polite">
          {saveState}
          {" · "}
          <button type="button" className="link" onClick={signOut}>
            Sign out
          </button>
        </div>
      </main>

      <div className="capture">
        <form onSubmit={submitCapture}>
          <span className="plus" aria-hidden="true">
            ＋
          </span>
          <input
            id="capture"
            placeholder="Capture a thought or paste a chat"
            aria-label="Capture a thought"
            autoComplete="off"
            value={capture}
            onChange={(e) => setCapture(e.target.value)}
          />
          <button className="send" type="submit" aria-label="Capture">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V5M6 11l6-6 6 6" />
            </svg>
          </button>
        </form>
        <div className="toast" role="status">
          {toast}
        </div>
      </div>
    </>
  );
}
