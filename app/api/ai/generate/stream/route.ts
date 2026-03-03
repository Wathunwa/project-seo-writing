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

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sse(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

export async function POST(req: Request) {
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
    `You are an SEO article writing assistant.`,
    `Write in ${langHint}. Tone: ${toneHint}.`,
    `Main keyword: "${mainKeyword}".`,
    secondaryKeywords.length
      ? `Secondary keywords: ${secondaryKeywords.map((k) => `"${k}"`).join(", ")}.`
      : `Secondary keywords: (none).`,
    `Target length: about ${targetWordCount} words (±10%).`,
    `Avoid keyword stuffing; keep usage natural.`,
    `Output Markdown starting with a single H1 "# <title>" then content with H2 sections.`,
    generateOutlineFirst ? `Create an outline then write the full article.` : `Write full article directly.`,
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