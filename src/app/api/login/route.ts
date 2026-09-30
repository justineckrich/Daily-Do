import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Sends a sign-in email, but only to ALLOWED_EMAIL. Everyone gets the same reply.
// Uses the implicit flow: the link carries the session itself, so it works even if the email
// is opened in a different browser than the one that asked for it.
export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };
  const normalized = (email ?? "").trim().toLowerCase();
  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();

  if (normalized && allowed && normalized === allowed) {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${request.nextUrl.origin}/auth/callback` },
    });
    if (error) {
      return NextResponse.json({ error: "The sign-in email could not be sent. Try again in a minute." }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
