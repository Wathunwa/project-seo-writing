export interface HeadingsCounts {
  h1: number;
  h2: number;
  h3: number;
}

export interface KeywordDensity {
  keyword: string;
  count: number;
  density: number; // percentage 0-100
}

export interface SeoMessage {
  key: string; // เช่น "msg.wordCountFarFromTarget"
  params?: Record<string, any>;
}

export interface SeoAnalysisResult {
  score: number;
  wordCount: number;
  densities: KeywordDensity[];
  headingsCounts: HeadingsCounts;

  issues: SeoMessage[];
  suggestions: SeoMessage[];
  checklist: {
    key: string; // เช่น "msg.keywordInTitle"
    ok: boolean;
    params?: Record<string, any>;
  }[];

  readabilityHints: SeoMessage[];

  metaDescriptionLength?: number;
  titleLength?: number;
}

/** Extract plain text from markdown (strip # and links) for word count. */
export function getPlainTextWords(content: string): string[] {
  const noMd = content
    .replace(/^#+\s*/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*?([^*]+)\*\*?/g, "$1")
    .replace(/__?([^_]+)__?/g, "$1")
    .replace(/`[^`]+`/g, " ");
  return noMd
    .split(/\s+/)
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);
}

export function getWordCount(content: string): number {
  return getPlainTextWords(content).length;
}

/** Get first H1 line from markdown (title). */
export function getFirstH1(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

/** Count headings by level. */
export function countHeadings(content: string): HeadingsCounts {
  const lines = content.split("\n");
  let h1 = 0,
    h2 = 0,
    h3 = 0;
  for (const line of lines) {
    if (line.startsWith("# ")) h1++;
    else if (line.startsWith("## ")) h2++;
    else if (line.startsWith("### ")) h3++;
  }
  return { h1, h2, h3 };
}

/** Keyword count in text (case-insensitive). */
export function keywordCount(text: string, keyword: string): number {
  if (!keyword.trim()) return 0;
  const k = keyword.trim().toLowerCase();
  const regex = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

/** First N words of plain text. */
export function getFirstNWords(content: string, n: number): string {
  const words = getPlainTextWords(content);
  return words.slice(0, n).join(" ");
}

/** Run full SEO analysis (deterministic scoring). */
export function analyzeSeo(
  content: string,
  mainKeyword: string,
  secondaryKeywords: string[],
  targetWordCount: number,
  metaDescription?: string,
  title?: string
): SeoAnalysisResult {
  const issues: SeoMessage[] = [];
  const suggestions: SeoMessage[] = [];
  const checklist: SeoAnalysisResult["checklist"] = [];
  const readabilityHints: SeoMessage[] = [];

  let score = 0;
  const maxScore = 100;

  const words = getPlainTextWords(content);
  const wordCount = words.length;

  const firstH1 = getFirstH1(content);
  const effectiveTitle = (title ?? firstH1).trim();
  const first100 = getFirstNWords(content, 100);
  const headings = countHeadings(content);

  const mainKw = mainKeyword.trim();
  const mainKwLower = mainKw.toLowerCase();

  // --- Word count (up to 15 points)
  const wordDiff = Math.abs(wordCount - targetWordCount);
  if (wordDiff <= 50) score += 15;
  else if (wordDiff <= 150) score += 12;
  else if (wordDiff <= 300) score += 8;
  else if (wordCount >= targetWordCount * 0.7) score += 5;
  else {
    issues.push({
      key: "msg.wordCountFarFromTarget",
      params: { wordCount, target: targetWordCount },
    });
  }

  // --- Main keyword in title (15 points)
  const mainInTitle =
    !!mainKw && effectiveTitle.toLowerCase().includes(mainKwLower);

  if (mainInTitle) {
    score += 15;
    checklist.push({ key: "msg.keywordInTitle", ok: true });
  } else {
    issues.push({ key: "msg.mainKeywordNotInTitle" });
    checklist.push({ key: "msg.keywordInTitle", ok: false });
  }

  // --- Main keyword in first 100 words (15 points)
  const mainInFirst100 =
    !!mainKw && first100.toLowerCase().includes(mainKwLower);

  if (mainInFirst100) {
    score += 15;
    checklist.push({ key: "msg.keywordInFirst100", ok: true });
  } else {
    issues.push({ key: "msg.mainKeywordNotInFirst100" });
    checklist.push({ key: "msg.keywordInFirst100", ok: false });
  }

  // --- Keyword density main (up to 20 points)
  const mainCount = mainKw ? keywordCount(content, mainKw) : 0;
  const mainDensity = wordCount > 0 ? (mainCount / wordCount) * 100 : 0;

  const densities: KeywordDensity[] = [
    {
      keyword: mainKw,
      count: mainCount,
      density: Math.round(mainDensity * 100) / 100,
    },
  ];

  for (const kwRaw of secondaryKeywords) {
    const kw = kwRaw.trim();
    if (!kw) continue;
    const c = keywordCount(content, kw);
    const d = wordCount > 0 ? (c / wordCount) * 100 : 0;
    densities.push({
      keyword: kw,
      count: c,
      density: Math.round(d * 100) / 100,
    });
  }

  // density checklist + issues
  if (!mainKw) {
    // ไม่มีคีย์หลักก็ยังไม่ให้คะแนน density
    checklist.push({
      key: "msg.keywordDensityInRange",
      ok: false,
      params: { density: mainDensity.toFixed(2) },
    });
  } else if (mainDensity >= 0.8 && mainDensity <= 2.5) {
    score += 20;
    checklist.push({
      key: "msg.keywordDensityInRange",
      ok: true,
      params: { density: mainDensity.toFixed(2) },
    });
  } else if (mainDensity > 2.5) {
    score += 5;
    issues.push({
      key: "msg.mainKeywordDensityTooHigh",
      params: { density: mainDensity.toFixed(2), min: 0.8, max: 2.5 },
    });
    checklist.push({
      key: "msg.keywordDensityInRange",
      ok: false,
      params: { density: mainDensity.toFixed(2), note: "overuse" },
    });
  } else {
    issues.push({
      key: "msg.mainKeywordDensityTooLow",
      params: { density: mainDensity.toFixed(2), min: 0.8, max: 2.5 },
    });
    checklist.push({
      key: "msg.keywordDensityInRange",
      ok: false,
      params: { density: mainDensity.toFixed(2) },
    });
  }

  // --- H2 per ~300 words (up to 15 points)
  const expectedH2 = Math.max(1, Math.floor(wordCount / 300));
  if (headings.h2 >= expectedH2) {
    score += 15;
    checklist.push({
      key: "msg.enoughH2",
      ok: true,
      params: { count: headings.h2 },
    });
  } else {
    suggestions.push({
      key: "msg.addMoreH2",
      params: { have: headings.h2, expected: expectedH2 },
    });
    checklist.push({
      key: "msg.enoughH2",
      ok: false,
      params: { count: headings.h2, expected: expectedH2 },
    });
  }

  // --- Meta description length 120–160 (10 points)
  const metaLen = metaDescription ? metaDescription.length : 0;

  if (metaLen >= 120 && metaLen <= 160) {
    score += 10;
    checklist.push({
      key: "msg.metaDescriptionLengthOk",
      ok: true,
      params: { chars: metaLen },
    });
  } else if (metaLen > 0) {
    if (metaLen < 120) {
      suggestions.push({
        key: "msg.metaDescriptionShort",
        params: { chars: metaLen, min: 120, max: 160 },
      });
    } else {
      suggestions.push({
        key: "msg.metaDescriptionLong",
        params: { chars: metaLen, min: 120, max: 160 },
      });
    }
    checklist.push({
      key: "msg.metaDescriptionLengthOk",
      ok: false,
      params: { chars: metaLen },
    });
  } else {
    checklist.push({
      key: "msg.metaDescriptionLengthOk",
      ok: false,
      params: { chars: 0, note: "not_set" },
    });
  }

  // --- Title length (10 points) — 30–60 chars ideal
  const titleLen = effectiveTitle.length;
  if (titleLen >= 30 && titleLen <= 60) {
    score += 10;
    checklist.push({
      key: "msg.titleLengthOk",
      ok: true,
      params: { chars: titleLen },
    });
  } else if (titleLen > 0) {
    checklist.push({
      key: "msg.titleLengthOk",
      ok: false,
      params: { chars: titleLen },
    });
  } else {
    checklist.push({
      key: "msg.titleLengthOk",
      ok: false,
      params: { chars: 0, note: "not_set" },
    });
  }

  // --- Readability: sentence length hint
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const avgWordsPerSentence = sentences.length ? wordCount / sentences.length : 0;

  if (avgWordsPerSentence > 25) {
    readabilityHints.push({ key: "msg.readabilitySentenceTooLong" });
  }
  if (headings.h2 === 0 && wordCount > 400) {
    readabilityHints.push({ key: "msg.readabilityAddH2" });
  }

  score = Math.min(maxScore, Math.max(0, score));

  return {
    score,
    wordCount,
    densities,
    headingsCounts: headings,
    issues,
    suggestions,
    checklist,
    readabilityHints,
    metaDescriptionLength: metaLen || undefined,
    titleLength: titleLen || undefined,
  };
}