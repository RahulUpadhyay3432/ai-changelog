import type { NextRequest } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isAuthorizedCron } from "@/lib/cron-auth";
import { sendEmail, emailConfigured, escapeHtml } from "@/lib/email";

// Weekly digest: the AI stories + trending tools that mattered this week, mailed
// to opted-in subscribers. Gated on RESEND_API_KEY — no key → no-op (reports it).
// Cron-triggered (see vercel.json).
export const runtime = "nodejs";
export const maxDuration = 120;

const APP_URL = "https://kapyn.app";

function getAdmin(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

interface Story { id: string; title: string; summary: string; source_name: string }
interface Tool { name: string; value_line: string; url: string; meta: string | null }

function buildHtml(stories: Story[], tools: Tool[], unsubUrl: string): string {
  const storyBlocks = stories
    .map(
      (s) => `
      <tr><td style="padding:0 0 22px">
        <a href="${APP_URL}/story/${s.id}" style="color:#17140f;text-decoration:none;font-size:17px;font-weight:700;line-height:1.3;font-family:'Space Grotesk',Georgia,serif">${escapeHtml(s.title)}</a>
        <p style="margin:6px 0 0;color:#4b463f;font-size:14.5px;line-height:1.55">${escapeHtml(s.summary)}</p>
        <div style="margin:6px 0 0;color:#8a857c;font-size:12.5px">${escapeHtml(s.source_name)} · <a href="${APP_URL}/story/${s.id}" style="color:#2563eb;text-decoration:none">Read</a></div>
      </td></tr>`
    )
    .join("");

  const toolBlocks = tools
    .map(
      (t) => `
      <tr><td style="padding:0 0 12px">
        <a href="${escapeHtml(t.url)}" style="color:#17140f;text-decoration:none;font-size:14.5px;font-weight:600">${escapeHtml(t.name)}</a>
        <span style="color:#6d675f;font-size:13.5px"> — ${escapeHtml(t.value_line)}</span>
      </td></tr>`
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f4f2ee;padding:24px 12px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px 28px">
      <tr><td>
        <div style="font-family:'Space Grotesk',Georgia,serif;font-size:20px;font-weight:700;letter-spacing:-0.02em;color:#17140f">kapyn</div>
        <div style="color:#8a857c;font-size:12.5px;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;margin-top:14px">This week in AI</div>
        <h1 style="font-family:'Space Grotesk',Georgia,serif;font-size:22px;font-weight:700;color:#17140f;margin:6px 0 22px;line-height:1.2">The stories that mattered</h1>
      </td></tr>
      <tr><td><table role="presentation" width="100%">${storyBlocks}</table></td></tr>
      ${
        tools.length
          ? `<tr><td style="padding-top:8px;border-top:1px solid #eae6df">
              <div style="color:#8a857c;font-size:12.5px;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;margin:18px 0 12px">Trending tools</div>
              <table role="presentation" width="100%">${toolBlocks}</table>
            </td></tr>`
          : ""
      }
      <tr><td style="padding-top:22px">
        <a href="${APP_URL}/radar/pulse" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:11px 20px;border-radius:10px">See the full Pulse</a>
      </td></tr>
      <tr><td style="padding-top:26px;border-top:1px solid #eae6df;margin-top:24px">
        <p style="color:#9e988c;font-size:12px;line-height:1.6;margin:16px 0 0">You're getting this because you subscribed at kapyn.app. <a href="${unsubUrl}" style="color:#6d675f">Unsubscribe</a> anytime.</p>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY required" }, { status: 500 });
  }

  const admin = getAdmin();

  // Subscribers first — if none, skip the (cheaper) compose entirely.
  const { data: subs } = await admin
    .from("email_subscribers")
    .select("email, unsubscribe_token")
    .is("unsubscribed_at", null)
    .eq("confirmed", true);

  if (!subs?.length) return Response.json({ sent: 0, subscribers: 0 });
  if (!emailConfigured()) {
    return Response.json({ skipped: "RESEND_API_KEY not set", subscribers: subs.length });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ data: storyRows }, { data: toolRows }] = await Promise.all([
    admin
      .from("news_items")
      .select("id, title, summary, source_name")
      .gte("published_at", weekAgo)
      .order("published_at", { ascending: false })
      .limit(6),
    admin
      .from("radar_tools")
      .select("name, value_line, url, meta, score")
      .eq("kind", "trending")
      .order("score", { ascending: false })
      .limit(4),
  ]);

  const stories = (storyRows ?? []) as Story[];
  const tools = (toolRows ?? []) as Tool[];
  if (stories.length === 0) return Response.json({ sent: 0, reason: "no stories this week" });

  const subject = `This week in AI: ${stories[0].title}`.slice(0, 120);

  let sent = 0;
  const failed: string[] = [];
  const results = await Promise.allSettled(
    subs.map(async (s) => {
      const unsubUrl = `${APP_URL}/api/email/unsubscribe?token=${encodeURIComponent(s.unsubscribe_token)}`;
      const ok = await sendEmail({ to: s.email, subject, html: buildHtml(stories, tools, unsubUrl) });
      if (ok) sent++;
      else failed.push(s.email);
    })
  );

  return Response.json({
    subscribers: subs.length,
    sent,
    failed: failed.length,
    errored: results.filter((r) => r.status === "rejected").length,
  });
}
