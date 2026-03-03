"use client";

import { useState, useEffect } from "react";
import type { SeoAnalysisResult } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

interface MetricsPanelProps {
  locale: Locale;
  content: string;
  seoResult: SeoAnalysisResult | null;
  targetWordCount: number;
  mainKeyword: string;
  secondaryKeywords: string[];
}

function getLiveWordCount(content: string): number {
  const text = content
    .replace(/^#+\s*/gm, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/\s+/)
    .filter(Boolean);
  return text.length;
}

export default function MetricsPanel({
  locale,
  content,
  seoResult,
  targetWordCount,
  mainKeyword,
  secondaryKeywords,
}: MetricsPanelProps) {
  const liveWordCount = getLiveWordCount(content);
  
  useEffect(()=>{
    console.log("checl locale ==> ",locale);
  },[locale])

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <h2 className="text-lg font-semibold text-slate-800">
          {t(locale, "metrics.title")}
        </h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Live word count (always visible) */}
        <section>
          <h3 className="text-sm font-medium text-slate-600 mb-2">
            {t(locale, "metrics.wordCount")}
          </h3>
          <p className="text-2xl font-semibold text-slate-900">
            {liveWordCount}
            <span className="text-sm font-normal text-slate-500 ml-1">
              / {targetWordCount} {t(locale, "metrics.target")}
            </span>
          </p>
        </section>

        {seoResult ? (
          <>
            {/* SEO Score */}
            <section>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {t(locale, "metrics.seoScore")}
              </h3>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-3xl font-bold ${
                    seoResult.score >= 70
                      ? "text-green-600"
                      : seoResult.score >= 40
                        ? "text-amber-600"
                        : "text-red-600"
                  }`}
                >
                  {seoResult.score}
                </span>
                <span className="text-slate-500">/ 100</span>
              </div>
            </section>

            {/* Keyword density */}
            <section>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {t(locale, "metrics.keywordDensity")}
              </h3>
              <ul className="space-y-1 text-sm">
                {seoResult.densities.map((d) => (
                  <li key={d.keyword} className="flex justify-between">
                    <span
                      className="text-slate-700 truncate max-w-[180px]"
                      title={d.keyword}
                    >
                      {d.keyword}
                    </span>
                    <span className="text-slate-900 font-medium">
                      {d.count} × ({d.density}%)
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Headings */}
            <section>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {t(locale, "metrics.headings")}
              </h3>
              <div className="flex gap-4 text-sm">
                <span>H1: {seoResult.headingsCounts.h1}</span>
                <span>H2: {seoResult.headingsCounts.h2}</span>
                <span>H3: {seoResult.headingsCounts.h3}</span>
              </div>
            </section>

            {/* Readability */}
            {seoResult.readabilityHints.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-slate-600 mb-2">
                  {t(locale, "metrics.readability")}
                </h3>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {seoResult.readabilityHints.map((m, i) => (
                    <li key={i}>{t(locale, m.key, m.params)}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Issues */}
            {seoResult.issues.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-red-700 mb-2">
                  {t(locale, "metrics.issues")}
                </h3>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {seoResult.issues.map((m, i) => (
                    <li key={i} className="text-red-800/90">
                      {t(locale, m.key, m.params)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Suggestions */}
            {seoResult.suggestions.length > 0 && (
              <section>
                <h3 className="text-sm font-medium text-amber-700 mb-2">
                  {t(locale, "metrics.suggestions")}
                </h3>
                <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                  {seoResult.suggestions.map((m, i) => (
                    <li key={i}>{t(locale, m.key, m.params)}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Checklist */}
            <section>
              <h3 className="text-sm font-medium text-slate-600 mb-2">
                {t(locale, "metrics.checklist")}
              </h3>
              <ul className="space-y-2">
                {seoResult.checklist.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span
                      className={`shrink-0 mt-0.5 ${item.ok ? "text-green-600" : "text-slate-400"}`}
                      aria-label={item.ok ? "Passed" : "Not passed"}
                    >
                      {item.ok ? "✓" : "○"}
                    </span>

                    <span
                      className={item.ok ? "text-slate-700" : "text-slate-500"}
                    >
                      {t(locale, item.key, item.params)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            Click &quot;Analyze SEO&quot; in the writer panel to see score,
            keyword density, headings, issues, and checklist.
          </p>
        )}
      </div>
    </div>
  );
}
