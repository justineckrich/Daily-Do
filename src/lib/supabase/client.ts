import { createBrowserClient } from "@supabase/ssr";

// keepalive lets a save finish even if the page is refreshed or closed mid-request.
// Browsers cap keepalive bodies at 64KB, so larger writes go without it.
const keepaliveFetch: typeof fetch = (input, init) => {
  const small = typeof init?.body !== "string" || init.body.length < 60_000;
  return fetch(input, { ...init, keepalive: small });
};

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: keepaliveFetch } },
  );
}
