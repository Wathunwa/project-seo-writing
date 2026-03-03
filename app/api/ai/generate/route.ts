import OpenAI from "openai";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ให้รันบน Node runtime (ปลอดภัยกับ SDK)

type Tone = "Neutral" | "Friendly" | "Professional";

type ReqBody = {
  mainKeyword: string;
  secondaryKeywords: string[];
  language: "Thai" | "English" | "Chinese"; // ให้ตรงกับ UI/locale ของคุณ
  tone: Tone;
  targetWordCount: number;
  generateOutlineFirst?: boolean;
};

type ResBody = {
  generatedTitle: string;
  generatedContent: string; // markdown (ไม่ต้องมี # title ซ้ำก็ได้)
  generatedMetaDescription: string;
};

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeJsonParse<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T;
  } catch {
    // บางทีโมเดลอาจมีข้อความครอบๆ ให้พยายามตัดเฉพาะ JSON ก้อน
    const m = text.match(/\{[\s\S]*\}$/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as T;
    } catch {
      return null;
    }
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY (set it in env)" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as Partial<ReqBody>;

    const mainKeyword = String(body.mainKeyword ?? "").trim();
    const secondaryKeywords = Array.isArray(body.secondaryKeywords)
      ? body.secondaryKeywords.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const language = (body.language ?? "Thai") as ReqBody["language"];
    const tone = (body.tone ?? "Neutral") as Tone;
    const targetWordCount = clamp(Number(body.targetWordCount ?? 1200) || 1200, 300, 5000);
    const generateOutlineFirst = Boolean(body.generateOutlineFirst);

    if (!mainKeyword) {
      return NextResponse.json({ error: "mainKeyword is required" }, { status: 400 });
    }

    const model = process.env.OPENAI_MODEL || "gpt-5-mini"; // คุณจะเปลี่ยนชื่อรุ่นเองได้

    const langHint =
      language === "Thai"
        ? "Thai"
        : language === "Chinese"
        ? "Simplified Chinese"
        : "English";

    const toneHint =
      tone === "Friendly" ? "friendly" : tone === "Professional" ? "professional" : "neutral";

    // บังคับรูปแบบเอาต์พุตเป็น JSON เพื่อ parse ง่าย
    const instructions = [
      `You are an SEO article writing assistant.`,
      `Write in ${langHint}.`,
      `Tone: ${toneHint}.`,
      `Main keyword: "${mainKeyword}".`,
      secondaryKeywords.length
        ? `Secondary keywords: ${secondaryKeywords.map((k) => `"${k}"`).join(", ")}.`
        : `Secondary keywords: (none).`,
      `Target length: about ${targetWordCount} words (±10%).`,
      `Avoid keyword stuffing. Keep main keyword density around 0.8%–2.5% (natural usage).`,
      `Use Markdown with clear structure and H2 sections.`,
      generateOutlineFirst
        ? `First create an outline, then write the full article.`
        : `Write the full article directly.`,
      `Return ONLY valid JSON with keys: generatedTitle, generatedContent, generatedMetaDescription.`,
      `generatedTitle should be a concise SEO-friendly title (30–60 chars if possible).`,
      `generatedMetaDescription should be 120–160 chars if possible.`,
      `generatedContent should be markdown body WITHOUT repeating the H1 line (no "# title" inside).`,
    ].join("\n");

    const response = await client.responses.create({
      model,
      // reasoning เลือก low ให้เร็ว/ประหยัด (ปรับได้)
      reasoning: { effort: "low" },
      instructions,
      input: "Generate the SEO article now.",
    });

    // SDK มี output_text ให้ใช้ตรง ๆ
    const text = response.output_text ?? "";

    const parsed = safeJsonParse<ResBody>(text);

    if (!parsed?.generatedTitle || !parsed?.generatedContent) {
      // fallback ถ้า parse ไม่ได้ ให้ส่งกลับเป็น plain text (กันระบบพัง)
      return NextResponse.json(
        {
          generatedTitle: mainKeyword,
          generatedContent: text || `Generated content for: ${mainKeyword}`,
          generatedMetaDescription: "",
          _warning: "Model output was not valid JSON; returned fallback content.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(parsed, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}