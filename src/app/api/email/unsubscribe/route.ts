import { createClient } from "@supabase/supabase-js";

// One-click, no-login unsubscribe. The digest footer links here with the row's
// token. GET (so it works straight from an email link); marks the row removed.
export const runtime = "nodejs";

function getAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

function page(message: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Kapyn</title></head>
<body style="margin:0;background:#0c0b0a;color:#f6f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center">
<div style="text-align:center;padding:32px;max-width:420px">
<div style="font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.02em">kapyn</div>
<p style="color:#bcb7ad;font-size:15px;line-height:1.6;margin-top:16px">${message}</p>
<a href="https://kapyn.app" style="color:#3b82f6;text-decoration:none;font-size:14px">Back to Kapyn</a>
</div></body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return page("This unsubscribe link is missing its token.");

  const { error } = await getAdmin()
    .from("email_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("unsubscribe_token", token);

  if (error) return page("Something went wrong. Email hello@kapyn.app and we'll remove you.");
  return page("You're unsubscribed from the Kapyn weekly digest. No more emails — thanks for reading.");
}
