/**
 * Mock AI content generator. No OpenAI; generates deterministic placeholder content
 * based on keywords and target length. For production, replace with real API call.
 */

export interface MockGenerateParams {
  mainKeyword: string;
  secondaryKeywords: string[];
  language: string;
  tone: "Neutral" | "Friendly" | "Professional";
  targetWordCount: number;
  generateOutlineFirst: boolean;
}

export interface MockGenerateResult {
  generatedTitle: string;
  generatedMetaDescription: string;
  generatedContent: string;
}

/** Build a placeholder title using main keyword. */
function buildTitle(mainKeyword: string): string {
  const k = mainKeyword.trim() || "Your Topic";
  return `${k}: A Complete Guide and Best Practices`;
}

/** Build meta description (aim 120–160 chars). */
function buildMetaDescription(mainKeyword: string, secondary: string[]): string {
  const k = mainKeyword.trim() || "your topic";
  const extra = secondary.length ? ` Learn about ${secondary.slice(0, 2).join(", ")}.` : "";
  const base = `Discover everything you need to know about ${k}.${extra}`;
  return base.length <= 160 ? base : base.slice(0, 157) + "...";
}

/** Generate placeholder markdown with approximate word count. */
function generatePlaceholderContent(
  mainKeyword: string,
  secondaryKeywords: string[],
  targetWordCount: number,
  tone: string
): string {
  const k = mainKeyword.trim() || "this topic";
  const sec = secondaryKeywords.filter(Boolean).slice(0, 4);
  const intro = `# ${k}: A Complete Guide\n\nIn this article we explore ${k} in depth.`;
  const paragraphs: string[] = [
    `Understanding ${k} is essential for anyone looking to get the best results. Whether you are just starting or already experienced, the following sections will help you.`,
    sec.length
      ? `Key areas we cover include ${sec.join(", ")}, and how they relate to ${k}.`
      : `We will cover the main concepts, best practices, and common pitfalls.`,
  ];
  let body = intro + "\n\n" + paragraphs.join("\n\n");
  const wordsSoFar = body.split(/\s+/).length;
  const sentenceTemplates = [
    `When it comes to ${k}, many people overlook the basics.`,
    `One important aspect of ${k} is consistency.`,
    `Experts often recommend focusing on ${k} from the start.`,
    sec[0] ? `The relationship between ${k} and ${sec[0]} is worth noting.` : `Practical tips can make a big difference.`,
    `In conclusion, ${k} remains a vital topic to master.`,
  ];
  let wordCount = body.split(/\s+/).length;
  let sectionIndex = 1;
  while (wordCount < targetWordCount * 0.85 && sectionIndex <= 5) {
    body += `\n\n## Section ${sectionIndex}: ${k} in practice\n\n`;
    for (let i = 0; i < 4 && wordCount < targetWordCount; i++) {
      const t = sentenceTemplates[(sectionIndex + i) % sentenceTemplates.length];
      body += t + " ";
      wordCount = body.split(/\s+/).length;
    }
    sectionIndex++;
  }
  return body.trim();
}

/** Artificial delay (ms). */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock generate: returns title, meta description, and markdown content. */
export async function mockGenerate(params: MockGenerateParams): Promise<MockGenerateResult> {
  const { mainKeyword, secondaryKeywords, targetWordCount, tone } = params;
  const title = buildTitle(mainKeyword);
  const metaDescription = buildMetaDescription(mainKeyword, secondaryKeywords);
  const generatedContent = generatePlaceholderContent(
    mainKeyword,
    secondaryKeywords,
    targetWordCount,
    tone
  );
  return {
    generatedTitle: title,
    generatedMetaDescription: metaDescription,
    generatedContent,
  };
}
