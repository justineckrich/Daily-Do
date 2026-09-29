import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Signs in with the 6-digit code from the email. Needed when Daily-Do runs from the home screen,
// where tapping the email link would open a separate browser.
export async function POST(request: NextRequest) {
  const { email, token } = (await request.json()) as { email?: string; token?: string };
  if (!email || !token) {
    return NextResponse.json({ error: "Enter your email and the code from the email." }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: "email",
  });
  if (error) {
    return NextResponse.json({ error: "That code didn't work. Request a new email and try again." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
