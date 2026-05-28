import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { title, summary } = await req.json();

  if (!title || !summary) {
    return NextResponse.json({ error: "Missing title or summary" }, { status: 400 });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent(
      `You are explaining a tech/AI news story to someone smart but not a specialist. Be concise and direct.

Headline: "${title}"
Summary: "${summary}"

Respond in exactly this format:

[2-3 sentences explaining what this is in plain English]

Why it matters: [1-2 sentences on the real-world significance or impact]

Rules:
- Use **bold** around 3-5 key technical terms, company names, or numbers that are most important
- No headers, no bullet points, no other markdown
- Bold only the most signal-rich words, not common words`
    );

    const text = result.response.text();
    return NextResponse.json({ explanation: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Breakdown API error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
