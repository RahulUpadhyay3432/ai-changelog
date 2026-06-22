import { NextResponse, userAgent, type NextRequest } from "next/server";

// Desktop front door: a cold visitor opening kapyn.app on a computer should see
// the real landing page (/home), not the mobile-shaped app shell. Phones and the
// installed PWA keep getting the app at /. This is a REWRITE (not a redirect) —
// the address bar stays kapyn.app, the visitor just sees the landing content.
//
// Only runs on "/" (see matcher) so there's zero overhead elsewhere.

export function middleware(req: NextRequest) {
  // PWA safeguard: a launched app passes ?app=1 (manifest start_url) — never send
  // an installed app to the marketing page, regardless of UA.
  if (req.nextUrl.searchParams.has("app")) {
    return NextResponse.next();
  }

  // Next's UA parser: device.type is "mobile" | "tablet" for those, and
  // undefined for desktop. Treat tablet as mobile (safe default → gets the app).
  const { device } = userAgent(req);
  const isDesktop = device.type === undefined;

  if (isDesktop) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
