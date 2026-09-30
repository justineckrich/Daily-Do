"use client";

import { useEffect, useState } from "react";

export default function LoginForm({ linkError }: { linkError: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    linkError ? "That sign-in link didn't work. It may have expired. Sign in with your password instead." : "",
  );

  // If Supabase sent the sign-in tokens here instead of /auth/callback, pass them along.
  useEffect(() => {
    if (window.location.hash.includes("access_token")) {
      window.location.replace(`/auth/callback${window.location.hash}`);
    }
  }, []);

  async function post(body: object) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
      return data as { signedIn?: boolean };
    } finally {
      setBusy(false);
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post({ email, password });
      window.location.replace("/");
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function sendLink() {
    if (!email.trim()) {
      setMessage("Enter your email first.");
      return;
    }
    try {
      await post({ email });
      setSent(true);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <main className="login">
      <div className="panel login-panel">
        <h1 className="title">Daily-Do</h1>
        {!sent ? (
          <form onSubmit={signIn} className="stack">
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field"
            />
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field"
            />
            <button className="btn primary" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
            </button>
            <button type="button" className="link" onClick={sendLink} disabled={busy}>
              Email me a sign-in link instead
            </button>
          </form>
        ) : (
          <div className="stack">
            <p className="muted">Check your email and tap the sign-in link. It opens Daily-Do and signs you in.</p>
            <button type="button" className="btn" onClick={() => setSent(false)}>
              Back
            </button>
          </div>
        )}
        {message && <p className="error">{message}</p>}
      </div>
    </main>
  );
}
