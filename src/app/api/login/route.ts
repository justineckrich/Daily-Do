import { NextResponse, type NextRequest } from "next/server";
import { createClient as createPlainClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

// Signs in ALLOWED_EMAIL only.
// With a password: signs in directly and sets the session cookies.
// Without one: emails a sign-in link (implicit flow, so the link works in any browser).
export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  const normalized = (email ?? "").trim().toLowerCase();
  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
  const isAllowed = Boolean(normalized && allowed && normalized === allowed);

  if (password) {
    if (!isAllowed) return NextResponse.json({ error: "That email or password is wrong." }, { status: 401 });
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email: normalized, password });
    if (error) return NextResponse.json({ error: "That email or password is wrong." }, { status: 401 });
    return NextResponse.json({ ok: true, signedIn: true });
  }

  if (isAllowed) {
    const supabase = createPlainClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { flowType: "implicit", persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
      email: normalized,
      options: { emailRedirectTo: `${request.nextUrl.origin}/auth/callback` },
    });
    if (error) {
      const limited = error.status === 429 || /rate limit|security purposes/i.test(error.message);
      return NextResponse.json(
        {
          error: limited
            ? "Supabase's free plan only sends a few sign-in emails per hour. Sign in with your password, or wait an hour and try again."
            : `The sign-in email could not be sent (${error.message}).`,
        },
        { status: limited ? 429 : 502 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
