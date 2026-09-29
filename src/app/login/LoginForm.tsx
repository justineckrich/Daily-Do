"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm({ linkError }: { linkError: boolean }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    linkError ? "That link expired or was opened in a different browser. Send a new one." : "",
  );

  async function post(path: string, body: object) {
    setBusy(true);
    setMessage("");
    try {
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Try again.");
      return data;
    } finally {
      setBusy(false);
    }
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post("/api/login", { email });
      setSent(true);
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    try {
      await post("/api/verify", { email, token: code });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <main className="login">
      <div className="panel login-panel">
        <h1 className="title">Daily-Do</h1>
        {!sent ? (
          <form onSubmit={sendLink} className="stack">
            <p className="muted">Sign in with your email. We&apos;ll send you a link and a code.</p>
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
          <form onSubmit={verify} className="stack">
            <p className="muted">
              Check your email. Tap the link on this device, or type the code from the email here.
            </p>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="field"
            />
            <button className="btn primary" disabled={busy || code.trim().length < 6}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button type="button" className="btn" onClick={() => setSent(false)}>
              Use a different email
            </button>
          </form>
        )}
        {message && <p className="error">{message}</p>}
      </div>
    </main>
  );
}
