"use client";

import { useEffect, useState } from "react";

export default function LoginForm({ linkError }: { linkError: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    linkError ? "That sign-in link didn't work. It may have expired. Send a new one." : "",
  );

  // If Supabase sent the sign-in tokens here instead of /auth/callback, pass them along.
  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      window.location.replace(`/auth/callback${window.location.hash}`);
    }
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
      setSent(true);
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login">
      <div className="panel login-panel">
        <h1 className="title">Daily-Do</h1>
        {!sent ? (
          <form onSubmit={sendLink} className="stack">
            <p className="muted">Sign in with your email. We&apos;ll send you a sign-in link.</p>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
            <button className="btn primary" disabled={busy}>
              {busy ? "Sending…" : "Email me a sign-in link"}
            </button>
          </form>
        ) : (
          <div className="stack">
            <p className="muted">Check your email and tap the sign-in link. It opens Daily-Do and signs you in.</p>
            <button type="button" className="btn" onClick={() => setSent(false)}>
              Send it again
            </button>
          </div>
        )}
        {message && <p className="error">{message}</p>}
      </div>
    </main>
  );
}
