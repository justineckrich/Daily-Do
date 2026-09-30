import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Sends a sign-in email, but only to ALLOWED_EMAIL. Everyone gets the same reply.
export async function POST(request: NextRequest) {
  const { email } = (await request.json()) as { email?: string };
  const normalized = (email ?? "").trim().toLowerCase();
  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();

  if (normalized && allowed && normalized === allowed) {
    const supabase = await createClient();
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
