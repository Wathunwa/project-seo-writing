# AI SEO Article Writer

A front-end web app for writing and optimizing articles with mock AI generation and SEO analysis. Two-panel layout: **Writer** (left) and **SEO Metrics** (right).

## Tech stack

- **Next.js 15** (App Router), **TypeScript** (strict), **TailwindCSS**
- Mock API routes for AI generate and SEO analyze (no OpenAI key required to run)
- Docker Compose: 2 Next.js replicas behind an Nginx load balancer

## Project structure

```
├── app/
│   ├── api/
│   │   ├── ai/generate/route.ts   # POST – mock AI generation
│   │   └── seo/analyze/route.ts   # POST – SEO analysis
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Split view (Writer | Metrics)
├── components/
│   ├── WriterPanel.tsx            # Left panel: inputs, editor, actions
│   └── MetricsPanel.tsx           # Right panel: score, density, checklist
├── lib/
│   ├── mockAi.ts                  # Mock content generator
│   └── seo.ts                     # SEO scoring & analysis helpers
├── nginx/
│   └── nginx.conf                 # Upstream web1:3000, web2:3000
├── Dockerfile                     # Multi-stage Next.js production
├── docker-compose.yml             # web1, web2, nginx
├── .env.example
└── README.md
```

## Requirements

- **Node.js** 18.18+ (or 20+) for local dev and build.
- **Docker** and **Docker Compose** for the multi-container setup.

## Local development

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev
```

No `.env` is required for mock mode. Use `.env.example` as a template if you add variables later.

## Docker Compose (production-style)

Build and run two app replicas behind Nginx:

```bash
docker compose up --build
```

- App (via Nginx): **http://localhost:8081**
- Containers: `ai_seo_web1`, `ai_seo_web2`, `ai_seo_nginx`

Stop:

```bash
docker compose down
```

ถ้าพอร์ต 80 หรือ 8080 ถูกใช้อยู่แล้ว แก้ใน `docker-compose.yml` ได้ เช่น `"3001:80"` แล้วเข้า **http://localhost:3001**

### How load balancing works

- **Nginx** listens on port 80 inside the container; the host exposes **8081** (so you don’t need to run as root and to avoid conflicts with other apps using port 80). Nginx uses an `upstream` block pointing to `web1:3000` and `web2:3000`.
- **`least_conn`** directs each request to the backend with the fewest active connections.
- **keepalive** and timeouts keep connections healthy; **max_fails** / **fail_timeout** avoid sending traffic to a failing container.
- Headers (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `Host`) are forwarded so the app sees the real client and scheme.

So the browser talks only to Nginx; Nginx distributes requests between the two Next.js instances.

## Plugging in OpenAI later

1. **Environment**
   - Add to `.env`: `OPENAI_API_KEY=sk-...` and optionally `OPENAI_MODEL=gpt-4o-mini` (or another model).
   - In Docker, pass these via `env_file: .env` or `environment` in `docker-compose.yml` for `web1` and `web2`.

2. **Code**
   - Replace the mock in `app/api/ai/generate/route.ts`: instead of calling `mockGenerate()` from `lib/mockAi.ts`, call the OpenAI API (e.g. with `openai` SDK).
   - Keep the same request/response shape: `mainKeyword`, `secondaryKeywords`, `language`, `tone`, `targetWordCount`, `generateOutlineFirst` in; `generatedTitle`, `generatedMetaDescription`, `generatedContent` out.
   - You can keep `lib/mockAi.ts` as fallback when `OPENAI_API_KEY` is missing.

## API endpoints (examples with curl)

### Generate (mock)

```bash
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mainKeyword": "best running shoes",
    "secondaryKeywords": ["marathon", "cushioning"],
    "language": "Thai",
    "tone": "Neutral",
    "targetWordCount": 1200,
    "generateOutlineFirst": false
  }'
```

Response: `{ "generatedTitle": "...", "generatedMetaDescription": "...", "generatedContent": "..." }` (markdown).

### Analyze SEO

```bash
curl -X POST http://localhost:3000/api/seo/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Best Running Shoes\n\nThis article is about best running shoes...",
    "mainKeyword": "best running shoes",
    "secondaryKeywords": ["marathon"],
    "targetWordCount": 1200,
    "metaDescription": "A short meta description between 120 and 160 characters so that search engines and users get a good summary of the page.",
    "title": "Best Running Shoes"
  }'
```

Response: `score`, `wordCount`, `densities`, `headingsCounts`, `issues`, `suggestions`, `checklist`, `readabilityHints`, etc.

## Scripts

| Script   | Description                |
|----------|----------------------------|
| `npm run dev`   | Start dev server           |
| `npm run build` | Production build           |
| `npm run start` | Start production server    |
| `npm run lint`  | Run ESLint                 |

## Features

- **Writer panel:** Main/secondary keywords, language (default Thai), tone, target word count, “Generate outline first” toggle; “Generate with AI (Mock)”, “Analyze SEO”, “Copy article”, “Download .md”; textarea with auto-save to `localStorage`.
- **Metrics panel:** Live word count; after “Analyze SEO”: SEO score (0–100), keyword densities, H1/H2/H3 counts, readability hints, issues, suggestions, checklist (title length, meta length, keyword in first 100 words, density range, etc.).
- **Mock AI:** No API key; deterministic placeholder content; 600–1200 ms delay.
- **SEO analyzer:** Deterministic scoring and explainable issues/suggestions.
