import { NextResponse, userAgent, type NextRequest } from "next/server";

// Desktop front door: a cold visitor opening kapyn.app on a computer should see
// the real landing page (/home), not the mobile-shaped app shell. Phones and the
// installed PWA keep getting the app at /. This is a REWRITE (not a redirect) —
// the address bar stays kapyn.app, the visitor just sees the landing content.
//
// Once a visitor explicitly enters the app (any "open the app" link → /?app=1,
// or the installed PWA's start_url), we set a cookie and stop rewriting for them
// — so the app's own nav back to "/" doesn't bounce a desktop user to the
// landing, and returning app-users land straight in the app.
//
// Only runs on "/" (see matcher) so there's zero overhead elsewhere.

const APP_COOKIE = "kapyn_app";

export function middleware(req: NextRequest) {
  // Explicit app entry — remember the choice for a year.
  if (req.nextUrl.searchParams.has("app")) {
    const res = NextResponse.next();
    res.cookies.set(APP_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return res;
  }

  // Returning app-users (and in-app nav back to "/") keep the app, no landing bounce.
  if (req.cookies.has(APP_COOKIE)) {
    return NextResponse.next();
  }

  // Cold desktop visitor → the landing. device.type is undefined for desktop,
  // "mobile"/"tablet" otherwise (tablet → app, a safe default).
  const { device } = userAgent(req);
  if (device.type === undefined) {
    const url = req.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.rewrite(url);
  }

  // Mobile/tablet → the app.
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
