import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey ?? anonKey);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    if (!message || message.length < 2 || message.length > 2000) {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("feedback").insert({ message });

    if (error) {
      console.error("feedback insert:", error);
      return Response.json({ error: "DB error" }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Bad request" }, { status: 400 });
  }
}
