"use client";

import { useState, useCallback, useEffect } from "react";
import WriterPanel from "@/components/WriterPanel";
import MetricsPanel from "@/components/MetricsPanel";
import type { SeoAnalysisResult } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

export default function Home() {
  const [content, setContent] = useState("");
  const [seoResult, setSeoResult] = useState<SeoAnalysisResult | null>(null);
  const [targetWordCount, setTargetWordCount] = useState(1200);
  const [mainKeyword, setMainKeyword] = useState("");
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);

  const [locale, setLocale] = useState<Locale>("th");

  const onContentChange = useCallback((value: string) => {
    setContent(value);
  }, []);

  const onSeoAnalyzed = useCallback((result: SeoAnalysisResult) => {
    setSeoResult(result);
  }, []);

  const onWriterParamsChange = useCallback(
    (params: {
      targetWordCount: number;
      mainKeyword: string;
      secondaryKeywords: string[];
    }) => {
      setTargetWordCount(params.targetWordCount);
      setMainKeyword(params.mainKeyword);
      setSecondaryKeywords(params.secondaryKeywords);
    },
    [],
  );

  // (optional) โหลดค่าจาก localStorage ครั้งแรก
  useEffect(() => {
    const saved = localStorage.getItem("locale");
    if (saved === "th" || saved === "en" || saved === "zh") {
      setLocale(saved);
    }
  }, []);

  const onLocaleChange = useCallback((l: Locale) => {
    setLocale(l);
    localStorage.setItem("locale", l);
  }, []);

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <section className="flex-1 min-w-0 border-r border-slate-200 flex flex-col">
        <WriterPanel
          content={content}
          onContentChange={onContentChange}
          onSeoAnalyzed={onSeoAnalyzed}
          onParamsChange={onWriterParamsChange}
          locale={locale}
          onLocaleChange={setLocale}
        />
      </section>
      <section className="w-[420px] shrink-0 flex flex-col bg-slate-50/80">
        <MetricsPanel
          locale={locale}
          content={content}
          seoResult={seoResult}
          targetWordCount={targetWordCount}
          mainKeyword={mainKeyword}
          secondaryKeywords={secondaryKeywords}
        />
      </section>
    </main>
  );
}
