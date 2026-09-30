"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Landing page for the sign-in link. Supabase puts the session tokens in the URL hash,
// so this has to run in the browser. The session is saved to cookies for the server.
export default function AuthCallback() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const access_token = hash.get("access_token");
      const refresh_token = hash.get("refresh_token");
      const code = new URLSearchParams(window.location.search).get("code");

      let error: unknown = hash.get("error_description");
      if (!error && access_token && refresh_token) {
        ({ error } = await supabase.auth.setSession({ access_token, refresh_token }));
      } else if (!error && code) {
        ({ error } = await supabase.auth.exchangeCodeForSession(code));
      } else if (!error) {
        error = "missing tokens";
      }

      if (error) setFailed(true);
      else window.location.replace("/");
    })();
  }, []);

  return (
    <main className="login">
      <div className="panel login-panel">
        <h1 className="title">Daily-Do</h1>
        {failed ? (
          <>
            <p className="error">That sign-in link didn&apos;t work. It may have expired or already been used.</p>
            <a className="btn primary" href="/login" style={{ textAlign: "center", textDecoration: "none" }}>
              Send a new link
            </a>
          </>
        ) : (
          <p className="muted">Signing you in…</p>
        )}
      </div>
    </main>
  );
}
