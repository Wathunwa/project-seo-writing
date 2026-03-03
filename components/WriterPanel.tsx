"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { SeoAnalysisResult } from "@/lib/seo";
import { t } from "@/lib/i18n";

const STORAGE_KEY = "ai-seo-writer-content";

type Locale = "th" | "en" | "zh";

function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "th";
  const v = window.localStorage.getItem("locale");
  if (v === "th" || v === "en" || v === "zh") return v;
  return "th";
}

function setsaveLocale(locale: Locale) {
  window.localStorage.setItem("locale", locale);
}

export function LangFlag({
  code,
  label,
  emoji,
  activeLocale,
  onSelect,
}: {
  code: Locale;
  label: string;
  emoji: string;
  activeLocale: Locale;
  onSelect: (lo: Locale) => void;
}) {
  const active = activeLocale === code;

  return (
    <button
      type="button"
      onClick={() => onSelect(code)}
      className={[
        "relative inline-flex items-center justify-center",
        "h-10 w-10 rounded-full border transition shadow-sm bg-white",
        active
          ? "border-slate-900 ring-2 ring-slate-300"
          : "border-slate-200 hover:border-slate-300",
      ].join(" ")}
      aria-label={`Switch language to ${label}`}
      title={label}
    >
      <span className="text-lg leading-none">{emoji}</span>

      <span
        className={[
          "absolute -bottom-1 -right-1",
          "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
          "border border-white",
          active ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-700",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}

export interface WriterParams {
  mainKeyword: string;
  secondaryKeywords: string[];
  language: string;
  tone: "Neutral" | "Friendly" | "Professional";
  targetWordCount: number;
  generateOutlineFirst: boolean;
}

interface WriterPanelProps {
  content: string;
  onContentChange: (value: string) => void;
  onSeoAnalyzed: (result: SeoAnalysisResult) => void;
  onParamsChange: (params: {
    targetWordCount: number;
    mainKeyword: string;
    secondaryKeywords: string[];
  }) => void;
  locale: Locale;
  onLocaleChange: (l: Locale) => void;
}

export default function WriterPanel({
  content,
  onContentChange,
  onSeoAnalyzed,
  onParamsChange,
  locale,
  onLocaleChange,
}: WriterPanelProps) {
  const [mainKeyword, setMainKeyword] = useState("");
  const [secondaryKeywordsRaw, setSecondaryKeywordsRaw] = useState("");
  const [language, setLanguage] = useState("Thai");
  const [tone, setTone] = useState<"Neutral" | "Friendly" | "Professional">(
    "Neutral",
  );
  const [targetWordCount, setTargetWordCount] = useState(1200);
  const [generateOutlineFirst, setGenerateOutlineFirst] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [metaDescription, setMetaDescription] = useState("");

  //check active locale
  const [activeLocale, setActiveLocale] = useState<Locale>("th");

  useEffect(() => {
    const saveActive = window.localStorage.getItem("locale");
    console.log("saveActive => ", saveActive);

    if (saveActive === "th" || saveActive === "en" || saveActive === "zh") {
      setActiveLocale(saveActive);
    } else {
      setActiveLocale("th");
    }
  }, []);

  const setLocale = (lo: Locale) => {
    setActiveLocale(lo);
    window.localStorage.setItem("locale", lo);
  };

  const secondaryKeywords = secondaryKeywordsRaw
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  // Auto-save content to localStorage
  useEffect(() => {
    if (content) localStorage.setItem(STORAGE_KEY, content);
  }, [content]);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved != null) onContentChange(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lastKeyRef = useRef("");
  const notifyParams = useCallback(() => {
    const key = JSON.stringify({
      targetWordCount,
      mainKeyword,
      secondaryKeywords,
    });
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    onParamsChange({ targetWordCount, mainKeyword, secondaryKeywords });
  }, [targetWordCount, mainKeyword, secondaryKeywords, onParamsChange]);

  useEffect(() => {
    notifyParams();
  }, [notifyParams]);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainKeyword,
          secondaryKeywords,
          language,
          tone,
          targetWordCount,
          generateOutlineFirst,
        }),
      });
      if (!res.ok) throw new Error("Generate failed");
      const data = await res.json();
      const newContent = [
        `# ${data.generatedTitle}`,
        "",
        data.generatedContent.startsWith("# ")
          ? data.generatedContent.replace(/^#\s+.+\n\n?/, "")
          : data.generatedContent,
      ].join("\n");
      onContentChange(newContent);
      setMetaDescription(data.generatedMetaDescription ?? "");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [
    mainKeyword,
    secondaryKeywords,
    language,
    tone,
    targetWordCount,
    generateOutlineFirst,
    onContentChange,
  ]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/seo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mainKeyword,
          secondaryKeywords,
          targetWordCount,
          metaDescription: metaDescription || undefined,
          title: content.match(/^#\s+(.+)$/m)?.[1] ?? undefined,
        }),
      });
      if (!res.ok) throw new Error("Analyze failed");
      const result: SeoAnalysisResult = await res.json();
      onSeoAnalyzed(result);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  }, [
    content,
    mainKeyword,
    secondaryKeywords,
    targetWordCount,
    metaDescription,
    onSeoAnalyzed,
  ]);

  const handleCopy = useCallback(() => {
    if (content) navigator.clipboard.writeText(content);
  }, [content]);

  const handleDownload = useCallback(() => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "article.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  const handleGenerateStreaming = useCallback(async () => {
    setLoading(true);

    let timer: ReturnType<typeof setInterval> | null = null;

    try {
      const res = await fetch("/api/ai/generate/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mainKeyword,
          secondaryKeywords,
          language,
          tone,
          targetWordCount,
          generateOutlineFirst,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      // เคลียร์ content ก่อนเริ่ม (เลือกได้)
      onContentChange("");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      let pending = "";

      timer = setInterval(() => {
        if (!pending) return;
        acc += pending;
        pending = "";
        onContentChange(acc);
      }, 50);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;

          const json = line.replace(/^data:\s*/, "");
          const msg = JSON.parse(json) as
            | { type: "start" }
            | { type: "delta"; delta: string }
            | { type: "done" }
            | { type: "error"; message: string };

          if (msg.type === "delta") {
            pending += msg.delta; // ✅ สะสมไว้ก่อน (ยังไม่ setState ทันที)
          }

          if (msg.type === "error") {
            throw new Error(msg.message);
          }

          if (msg.type === "done") {
            // ✅ flush รอบสุดท้ายทันที
            if (pending) {
              acc += pending;
              pending = "";
            }
            onContentChange(acc);
          }
        }
      }

      // ✅ เผื่อ stream ปิดโดยไม่มี done: flush ท้าย
      if (pending) {
        acc += pending;
        pending = "";
        onContentChange(acc);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [
    mainKeyword,
    secondaryKeywords,
    language,
    tone,
    targetWordCount,
    generateOutlineFirst,
    onContentChange,
  ]);

  const showSkeleton = loading && content.trim().length === 0;
  const showGeneratingBadge = loading;

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 px-4 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-slate-800">
            AI SEO Writer.
          </h1>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <LangFlag
              code="th"
              label="TH"
              emoji="🇹🇭"
              activeLocale={locale}
              onSelect={onLocaleChange}
            />
            <LangFlag
              code="en"
              label="EN"
              emoji="🇺🇸"
              activeLocale={locale}
              onSelect={onLocaleChange}
            />
            <LangFlag
              code="zh"
              label="中文"
              emoji="🇨🇳"
              activeLocale={locale}
              onSelect={onLocaleChange}
            />
          </div>
        </div>
      </header>

      <div className="shrink-0 px-4 py-3 space-y-3 border-b border-slate-200 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t(locale, "writer.mainKeyword")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              placeholder={t(locale, "writer.mainKeywordPlaceholder")}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t(locale, "writer.secondaryKeywords")}
            </label>
            <input
              type="text"
              value={secondaryKeywordsRaw}
              onChange={(e) => setSecondaryKeywordsRaw(e.target.value)}
              placeholder={t(locale, "writer.secondaryKeywordsPlaceholder")}
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t(locale, "writer.language")}
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="Thai">{t(locale, "writer.langThai")}</option>
              <option value="English">{t(locale, "writer.langEnglish")}</option>
              <option value="Chinese">{t(locale, "writer.langChinese")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t(locale, "writer.tone")}
            </label>
            <select
              value={tone}
              onChange={(e) =>
                setTone(
                  e.target.value as "Neutral" | "Friendly" | "Professional",
                )
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="Neutral">{t(locale, "writer.toneNeutral")}</option>
              <option value="Friendly">
                {t(locale, "writer.toneFriendly")}
              </option>
              <option value="Professional">
                {t(locale, "writer.toneProfessional")}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t(locale, "writer.targetWordCount")}
            </label>
            <input
              type="number"
              min={300}
              max={5000}
              value={targetWordCount}
              onChange={(e) =>
                setTargetWordCount(Number(e.target.value) || 1200)
              }
              className="w-28 rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={generateOutlineFirst}
                onChange={(e) => setGenerateOutlineFirst(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700">
                {t(locale, "writer.generateOutlineFirst")}
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? t(locale, "writer.generating")
              : t(locale, "writer.generateMock")}
          </button> */}
          <button
            onClick={handleGenerateStreaming}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? t(locale, "writer.generating")
              : t(locale, "writer.generateMock")}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-4 py-2 rounded bg-slate-600 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {analyzing
              ? t(locale, "writer.analyzing")
              : t(locale, "writer.analyzeSeo")}
          </button>

          <button
            onClick={handleCopy}
            disabled={!content}
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            {t(locale, "writer.copyArticle")}
          </button>

          <button
            onClick={handleDownload}
            disabled={!content}
            className="px-4 py-2 rounded border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 disabled:opacity-50"
          >
            {t(locale, "writer.downloadMd")}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 p-4 mb-10">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {t(locale, "writer.articleContent")}
        </label>

        <div className="relative h-full min-h-[200px]">
          <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder={t(locale, "writer.articlePlaceholder")}
            className={[
              "w-full h-full min-h-[200px] rounded border border-slate-300 px-3 py-2 text-sm font-mono",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none",
            ].join(" ")}
            spellCheck={true}
            disabled={loading} // จะให้พิมพ์ระหว่าง stream ก็เอาออกได้
          />

          {/* ✅ Shimmer แสดงเฉพาะตอนยังไม่มี content */}
          {showSkeleton && (
            <div className="pointer-events-none absolute inset-0 rounded overflow-hidden">
              <div className="absolute inset-0 bg-white/60" />
              <div className="absolute inset-0 p-3">
                <div className="animate-pulse space-y-3 opacity-70">
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-5/6 rounded bg-slate-200" />
                  <div className="h-4 w-4/6 rounded bg-slate-200" />
                  <div className="h-4 w-11/12 rounded bg-slate-200" />
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-4 w-10/12 rounded bg-slate-200" />
                  <div className="h-4 w-2/5 rounded bg-slate-200" />
                </div>
              </div>
            </div>
          )}

          {/* ✅ ตอนมีข้อมูลแล้ว ให้เหลือแค่ badge เล็กๆ */}
          {showGeneratingBadge && (
            <div className="pointer-events-none absolute bottom-3 right-3 text-xs text-slate-600 flex items-center gap-2 bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-sm">
              <span className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
              <span>{t(locale, "writer.generating")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
