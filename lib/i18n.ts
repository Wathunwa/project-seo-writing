export type Locale = "th" | "en" | "zh";

export const messages = {
  th: {
    metrics: {
      title: "SEO Metrics",
      wordCount: "จำนวนคำ",
      target: "เป้าหมาย",
      seoScore: "คะแนน SEO",
      keywordDensity: "ความหนาแน่นคีย์เวิร์ด",
      headings: "หัวข้อ",
      issues: "ปัญหา",
      suggestions: "คำแนะนำ",
      checklist: "เช็กลิสต์",
      notSet: "ยังไม่ได้ตั้ง",
      readability: "ความอ่านง่าย",
      emptyHint:
        'กด "Analyze SEO" เพื่อดูคะแนน ความหนาแน่นคีย์เวิร์ด หัวข้อ ปัญหา และเช็กลิสต์',
      passed: "ผ่าน",
      notPassed: "ไม่ผ่าน",
    },
    msg: {
      wordCountFarFromTarget:
        "จำนวนคำ ({wordCount}) ห่างจากเป้าหมาย ({target}).",
      mainKeywordDensityTooHigh:
        "ความหนาแน่นคีย์หลัก ({density}%) สูงเกินไป ควรอยู่ช่วง {min}%–{max}%.",
      metaDescriptionShort:
        "Meta description สั้นเกินไป ({chars} ตัวอักษร) ควรอยู่ช่วง {min}–{max}.",
      keywordInTitle: "มีคีย์หลักในชื่อเรื่อง",
      keywordInFirst100: "มีคีย์หลักใน 100 คำแรก",
      enoughH2: "มี H2 เพียงพอ (~1 ต่อ 300 คำ) ({count} H2)",
      titleLengthOk: "ความยาวชื่อเรื่อง 30–60 ตัวอักษร ({chars} ตัวอักษร)",
      metaDescriptionLengthOk:
        "Meta description 120–160 ตัวอักษร ({chars} ตัวอักษร)",
      mainKeywordNotInTitle: "คีย์หลักไม่ได้อยู่ในชื่อเรื่อง (H1 แรก).",
      mainKeywordNotInFirst100: "ควรมีคีย์หลักใน 100 คำแรก.",
      keywordDensityInRange:
        "ความหนาแน่นคีย์หลักอยู่ในช่วง 0.8%–2.5% ({density}%).",
      mainKeywordDensityTooLow:
        "ความหนาแน่นคีย์หลัก ({density}%) ต่ำเกินไป ควรอยู่ช่วง {min}%–{max}%.",
      addMoreH2: "เพิ่มหัวข้อ H2 (มี {have} หัวข้อ แนะนำประมาณ {expected}).",
      metaDescriptionLong:
        "Meta description ยาวเกินไป ({chars} ตัวอักษร) ควรอยู่ช่วง {min}–{max}.",
      readabilitySentenceTooLong:
        "ประโยคยาวเกินไป ควรใช้ประโยคสั้นเพื่อให้อ่านง่ายขึ้น.",
      readabilityAddH2: "เพิ่มหัวข้อย่อย (H2) เพื่อแบ่งเนื้อหาให้อ่านง่ายขึ้น.",
    },
    writer: {
      mainKeyword: "คีย์หลัก",
      mainKeywordPlaceholder: "เช่น รองเท้า วิ่ง ดีที่สุด",
      secondaryKeywords: "คีย์รอง (คั่นด้วยเครื่องหมาย ,)",
      secondaryKeywordsPlaceholder: "เช่น มาราธอน, ซัพพอร์ต, เทรล",
      language: "ภาษา",
      tone: "โทน",
      targetWordCount: "จำนวนคำเป้าหมาย",
      generateOutlineFirst: "สร้างโครงร่างก่อน",
    
      langThai: "ไทย",
      langEnglish: "อังกฤษ",
      langChinese: "จีน",
    
      toneNeutral: "กลาง",
      toneFriendly: "เป็นกันเอง",
      toneProfessional: "ทางการ",
    
      generating: "กำลังสร้าง…",
      generateMock: "สร้างด้วย AI",
      analyzing: "กำลังวิเคราะห์…",
      analyzeSeo: "วิเคราะห์ SEO",
      copyArticle: "คัดลอกบทความ",
      downloadMd: "ดาวน์โหลด .md",
    
      articleContent: "เนื้อหาบทความ",
      articlePlaceholder:
        "เขียนหรือวางบทความของคุณที่นี่ (รองรับ Markdown) ระบบจะบันทึกอัตโนมัติใน localStorage.",
    },
  },
  en: {
    metrics: {
      title: "SEO Metrics",
      wordCount: "Word count",
      target: "target",
      seoScore: "SEO Score",
      keywordDensity: "Keyword density",
      headings: "Headings",
      issues: "Issues",
      suggestions: "Suggestions",
      checklist: "Checklist",
      notSet: "Not set",
      readability: "Readability",
      emptyHint:
        'Click "Analyze SEO" in the writer panel to see score, keyword density, headings, issues, and checklist.',
      passed: "Passed",
      notPassed: "Not passed",
    },
    msg: {
      wordCountFarFromTarget:
        "Word count ({wordCount}) is far from target ({target}).",
      mainKeywordDensityTooHigh:
        "Main keyword density ({density}%) is too high; aim for {min}%–{max}%.",
      metaDescriptionShort:
        "Meta description is short ({chars} chars). Aim for {min}–{max}.",
      keywordInTitle: "Main keyword in title",
      keywordInFirst100: "Main keyword in first 100 words",
      enoughH2: "Enough H2 subheadings (~1 per 300 words) ({count} H2)",
      titleLengthOk: "Title length 30–60 chars ({chars} chars)",
      metaDescriptionLengthOk:
        "Meta description length 120–160 chars ({chars} chars)",
      mainKeywordNotInTitle: "Main keyword is not in the title (first H1).",
      mainKeywordNotInFirst100:
        "Main keyword should appear in the first 100 words.",
      keywordDensityInRange:
        "Main keyword density in range 0.8%–2.5% ({density}%).",
      mainKeywordDensityTooLow:
        "Main keyword density ({density}%) is low; aim for {min}%–{max}%.",
      addMoreH2:
        "Add more H2 subheadings (have {have}, ~{expected} recommended).",
      metaDescriptionLong:
        "Meta description is long ({chars} chars). Aim for {min}–{max}.",
      readabilitySentenceTooLong:
        "Average sentence length is high; shorter sentences improve readability.",
      readabilityAddH2: "Add subheadings (H2) to break up long content.",
    },
    writer: {
      mainKeyword: "Main keyword",
      mainKeywordPlaceholder: "e.g. best running shoes",
      secondaryKeywords: "Secondary keywords (comma separated)",
      secondaryKeywordsPlaceholder: "e.g. marathon, cushioning, trail",
      language: "Language",
      tone: "Tone",
      targetWordCount: "Target word count",
      generateOutlineFirst: "Generate outline first",
    
      langThai: "Thai",
      langEnglish: "English",
      langChinese: "Chinese",
    
      toneNeutral: "Neutral",
      toneFriendly: "Friendly",
      toneProfessional: "Professional",
    
      generating: "Generating…",
      generateMock: "Generate with AI",
      analyzing: "Analyzing…",
      analyzeSeo: "Analyze SEO",
      copyArticle: "Copy article",
      downloadMd: "Download .md",
    
      articleContent: "Article content",
      articlePlaceholder:
        "Write or paste your article here (markdown supported). Content auto-saves to localStorage.",
    },
  },
  zh: {
    metrics: {
      title: "SEO 指标",
      wordCount: "字数",
      target: "目标",
      seoScore: "SEO 分数",
      keywordDensity: "关键词密度",
      headings: "标题",
      issues: "问题",
      suggestions: "建议",
      checklist: "检查清单",
      notSet: "未设置",
      readability: "可读性",
      emptyHint:
        "点击 “Analyze SEO” 查看分数、关键词密度、标题、问题与检查清单。",
      passed: "通过",
      notPassed: "未通过",
    },
    msg: {
      wordCountFarFromTarget: "字数（{wordCount}）与目标（{target}）差距较大。",
      mainKeywordDensityTooHigh:
        "主关键词密度（{density}%）过高；建议 {min}%–{max}%。",
      metaDescriptionShort: "Meta 描述过短（{chars} 字符），建议 {min}–{max}。",
      keywordInTitle: "标题包含主关键词",
      keywordInFirst100: "前 100 个词包含主关键词",
      enoughH2: "H2 数量足够（约每 300 词 1 个）（{count} 个 H2）",
      titleLengthOk: "标题长度 30–60 字符（{chars}）",
      metaDescriptionLengthOk: "Meta 描述长度 120–160 字符（{chars}）",
      mainKeywordNotInTitle: "标题（第一个 H1）未包含主关键词。",
      mainKeywordNotInFirst100: "主关键词应出现在前 100 个词中。",
      keywordDensityInRange: "主关键词密度在 0.8%–2.5% 范围内（{density}%）。",
      mainKeywordDensityTooLow:
        "主关键词密度（{density}%）过低；建议 {min}%–{max}%。",
      addMoreH2: "建议增加 H2 小标题（当前 {have} 个，推荐约 {expected} 个）。",
      metaDescriptionLong: "Meta 描述过长（{chars} 字符），建议 {min}–{max}。",
      readabilitySentenceTooLong: "平均句子长度较高，使用更短的句子会更易读。",
      readabilityAddH2: "添加小标题（H2）以拆分长内容，提高可读性。",
    },
    writer: {
      mainKeyword: "主关键词",
      mainKeywordPlaceholder: "例如：最佳跑鞋",
      secondaryKeywords: "次要关键词（用逗号分隔）",
      secondaryKeywordsPlaceholder: "例如：马拉松、缓震、越野",
      language: "语言",
      tone: "语气",
      targetWordCount: "目标字数",
      generateOutlineFirst: "先生成大纲",
    
      langThai: "泰语",
      langEnglish: "英语",
      langChinese: "中文",
    
      toneNeutral: "中性",
      toneFriendly: "友好",
      toneProfessional: "专业",
    
      generating: "生成中…",
      generateMock: "用 AI 生成",
      analyzing: "分析中…",
      analyzeSeo: "分析 SEO",
      copyArticle: "复制文章",
      downloadMd: "下载 .md",
    
      articleContent: "文章内容",
      articlePlaceholder:
        "在此编写或粘贴文章（支持 Markdown）。内容会自动保存到 localStorage。",
    },
  },
} as const;

export function t(
  locale: Locale,
  keyPath: string,
  params?: Record<string, any>,
) {
  const parts = keyPath.split(".");
  let cur: any = messages[locale];
  for (const p of parts) cur = cur?.[p];
  const template = typeof cur === "string" ? cur : keyPath;

  return template.replace(/\{(\w+)\}/g, (_, k) =>
    String(params?.[k] ?? `{${k}}`),
  );
}
