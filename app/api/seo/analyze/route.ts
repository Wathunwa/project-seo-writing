import { NextResponse } from "next/server";
import { analyzeSeo } from "@/lib/seo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const content = typeof body.content === "string" ? body.content : "";

    const mainKeyword =
      typeof body.mainKeyword === "string" ? body.mainKeyword.trim() : "";

    const secondaryKeywords = Array.isArray(body.secondaryKeywords)
      ? body.secondaryKeywords
          .map((x: any) => String(x ?? "").trim())
          .filter(Boolean)
      : [];

    const targetWordCountRaw = body.targetWordCount;
    const targetWordCount =
      (typeof targetWordCountRaw === "number" && targetWordCountRaw > 0
        ? targetWordCountRaw
        : typeof targetWordCountRaw === "string"
          ? Number(targetWordCountRaw)
          : NaN) || 1200;

    const metaDescription =
      typeof body.metaDescription === "string" && body.metaDescription.trim()
        ? body.metaDescription.trim()
        : undefined;

    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : undefined;

    const result = analyzeSeo(
      content,
      mainKeyword,
      secondaryKeywords,
      targetWordCount,
      metaDescription,
      title
    );

    return NextResponse.json(result);
  } catch (e) {
    console.error("Analyze error:", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}