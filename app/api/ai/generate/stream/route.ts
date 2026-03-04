import OpenAI from "openai";

export const runtime = "nodejs";

type Tone = "Neutral" | "Friendly" | "Professional";

type ReqBody = {
  mainKeyword: string;
  secondaryKeywords: string[];
  language: "Thai" | "English" | "Chinese";
  tone: Tone;
  targetWordCount: number;
  generateOutlineFirst?: boolean;
};

function sse(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  if (!process.env.OPENAI_API_KEY) {
    return new Response(sse({ type: "error", message: "Missing OPENAI_API_KEY" }), {
      status: 500,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const body = (await req.json()) as Partial<ReqBody>;
  const mainKeyword = String(body.mainKeyword ?? "").trim();
  const secondaryKeywords = Array.isArray(body.secondaryKeywords)
    ? body.secondaryKeywords.map((x) => String(x ?? "").trim()).filter(Boolean)
    : [];
  const language = (body.language ?? "Thai") as ReqBody["language"];
  const tone = (body.tone ?? "Neutral") as Tone;
  const targetWordCount = Number(body.targetWordCount ?? 1200) || 1200;
  const generateOutlineFirst = Boolean(body.generateOutlineFirst);

  if (!mainKeyword) {
    return new Response(sse({ type: "error", message: "mainKeyword is required" }), {
      status: 400,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  const model = process.env.OPENAI_MODEL || "gpt-5-mini";

  const langHint =
    language === "Thai" ? "Thai" : language === "Chinese" ? "Simplified Chinese" : "English";

  const toneHint =
    tone === "Friendly" ? "friendly" : tone === "Professional" ? "professional" : "neutral";

  // ✅ ให้โมเดล “พิมพ์ markdown” ออกมาตรงๆ เพื่อ stream ลง textarea ได้เลย
const instructions = [
  // Role
  `You are a world-class SEO content strategist + editorial writer.`,
  `Your job: create a helpful, accurate, non-clickbait article that can rank for the main keyword while satisfying search intent.`,

  // Language & tone
  `Write in ${langHint}. Tone: ${toneHint}.`,
  `Use natural language for humans first; optimize for SEO second.`,

  // Keyword targets
  `Primary keyword (must appear naturally): "${mainKeyword}".`,
  secondaryKeywords.length
    ? `Secondary keywords (use where relevant, naturally, no stuffing): ${secondaryKeywords
        .map((k) => `"${k}"`)
        .join(", ")}.`
    : `Secondary keywords: none.`,

  // Intent + audience
  `Infer the most likely search intent for "${mainKeyword}" (informational/commercial/how-to) and write to fully satisfy it.`,
  `Assume the reader is smart but busy: make it skimmable and actionable.`,

  // SEO constraints
  `Target length: ~${targetWordCount} words (±10%).`,
  `Keyword usage rules: avoid stuffing; keep primary keyword density roughly 0.8%–2.0% if possible; use synonyms/related terms.`,
  `Add semantic coverage: include related concepts, FAQs, and practical examples.`,
  `Use short paragraphs, bullets, and tables only if it improves clarity.`,

  // Structure requirements
  `Output MUST be Markdown.`,
  `Start with exactly ONE H1 in this format: "# <SEO title>" (no extra H1s).`,
  `Then write a 2–3 sentence hook/intro that mentions the primary keyword once naturally.`,
  `Use multiple H2 sections (##) with descriptive, keyword-relevant headings.`,
  `Where helpful, include H3 subpoints (###) under an H2.`,
  `Include a short "Key takeaways" bullet list near the top (after the intro).`,
  `Include a dedicated FAQ section with 4–6 questions (as H2 or H3), each answered concisely.`,
  `End with a brief conclusion + next-step suggestion.`,

  // Meta
  `After the article, output a "Meta" block exactly like this:`,
  `---`,
  `Meta title: <60 chars ideal>`,
  `Meta description: <120–160 chars ideal>`,
  `Slug: <kebab-case>`,
  `---`,

  // Outline option
  generateOutlineFirst
    ? `Before writing, output a short outline (bullets) titled "Outline" then write the full article.`
    : `Write the full article directly (no separate outline).`,

  // Quality & safety
  `Do not invent facts, stats, or citations. If a claim needs data, phrase it generally.`,
  `Avoid repeating the same sentence patterns. Vary rhythm and wording.`,
].join("\n");

  const stream = await client.responses.create({
    model,
    stream: true, // ✅ เปิดสตรีม :contentReference[oaicite:1]{index=1}
    instructions,
    input: "Generate the SEO article now.",
  });

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      // ส่ง event เริ่มต้น
      controller.enqueue(encoder.encode(sse({ type: "start" })));

      try {
        for await (const event of stream) {
          // event.type สำคัญที่เจอบ่อย: response.output_text.delta :contentReference[oaicite:2]{index=2}
          if (event.type === "response.output_text.delta") {
            controller.enqueue(encoder.encode(sse({ type: "delta", delta: event.delta })));
          }

          if (event.type === "response.completed") {
            controller.enqueue(encoder.encode(sse({ type: "done" })));
          }

          if (event.type === "error" || event.type === "response.failed") {
            controller.enqueue(
              encoder.encode(
                sse({ type: "error", message: (event as any).error?.message ?? "stream error" })
              )
            );
          }
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(sse({ type: "error", message: e?.message ?? "error" })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}