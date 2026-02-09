# CLAUDE.md — work.krd

## Project Overview

**work.krd** is an AI-powered, multilingual resume builder SaaS application. Users create professional, ATS-optimized resumes with AI assistance in English, Arabic, and Kurdish Sorani. Features include AI content generation, multiple PDF templates, resume import (PDF/DOCX), ATS scoring, and a subscription-based tier system (FREE, BASIC, PRO). Includes an admin dashboard for system management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Components) |
| Language | TypeScript 5.8 (strict mode) |
| UI | React 19, Tailwind CSS 3.4, CVA for variants |
| Database | PostgreSQL (Neon.tech), Prisma 6.9 ORM |
| Auth | Clerk 6.22 + Svix webhooks |
| AI | OpenRouter API (Google Gemini 3 Flash) via OpenAI SDK |
| PDF | @react-pdf/renderer (generation), pdf-lib (manipulation), pdfjs-dist (viewing) |
| Email | Resend |
| Icons | Lucide React |
| Notifications | react-hot-toast |
| Deploy | Netlify, Node.js 22 |

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # ~36 API routes organized by feature
│   │   ├── admin/          # Admin operations (users, resumes, settings, stats)
│   │   ├── ai/             # AI generation (summary, bullets, skills, enhance)
│   │   ├── ats/            # ATS scoring and keyword analysis
│   │   ├── resumes/        # Resume CRUD + quick-save
│   │   ├── resume/import/  # PDF/DOCX import
│   │   ├── pdf/generate/   # PDF export
│   │   ├── user/           # Subscription & permissions
│   │   ├── subscriptions/  # Plan upgrades, billing
│   │   └── webhooks/       # Clerk webhook handler
│   ├── dashboard/          # User dashboard
│   ├── resume-builder/     # Resume editor + import flow
│   ├── admin/              # Admin pages (users, resumes)
│   ├── billing/            # Billing pages
│   └── sign-in/, sign-up/  # Clerk auth pages
│
├── components/
│   ├── ui/                 # Base components (button, card, input, badge, etc.)
│   ├── resume-builder/     # Resume editor UI + form sections/
│   ├── resume-pdf/         # PDF template components, styles, utils
│   ├── ai/                 # AI feature components (summary, skills, enhance)
│   ├── admin/              # Admin dashboard components
│   ├── landing/            # Landing page sections
│   ├── shared/             # Shared layout components (AppHeader)
│   └── pdf/                # PDF viewer components
│
├── lib/                    # Utility modules
│   ├── prisma.ts           # Prisma client singleton
│   ├── db.ts               # DB helpers (getCurrentUser, checkUserLimits, CRUD)
│   ├── ai.ts               # AIService class
│   ├── resume-parser.ts    # DOCX/PDF import parsing
│   ├── pdfGenerator.tsx    # Server-side PDF rendering
│   ├── pdfFonts.ts         # Font registration for PDF
│   ├── getTemplate.tsx     # Template resolution
│   └── ...                 # image-utils, language detection, system-settings
│
├── hooks/                  # Custom hooks (useAutoSave, useAutoTranslation, useResumeData)
├── contexts/               # LanguageContext (i18n), SubscriptionContext (permissions)
├── types/                  # TypeScript types (resume.ts, api.ts, subscription.ts)
├── locales/                # Translations: en/, ar/, ckb/ (common.json each)
└── middleware.ts           # Clerk route protection

prisma/schema.prisma        # Database schema
scripts/                    # Dev utilities (sync-dev-user, add-user-roles, check-user)
```

## Dev Commands

```bash
npm run dev        # Start dev server (0.0.0.0:3000)
npm run build      # Production build (runs prisma generate first via postinstall)
npm run start      # Start production server
npm run lint       # ESLint
npm run analyze    # Build with bundle analyzer (ANALYZE=true)
```

Node version: 22+ (see .nvmrc)

## Database Schema (Prisma)

Five models: **User**, **Resume**, **ResumeSection**, **Subscription**, **SystemSettings**

- `User` — clerkId (unique), email, name, role (USER/ADMIN). Has many resumes, one subscription.
- `Resume` — title, template, status (DRAFT/PUBLISHED/ARCHIVED), personalInfo (JSON), summary. Has many sections.
- `ResumeSection` — type enum (WORK_EXPERIENCE, EDUCATION, SKILLS, LANGUAGES, CERTIFICATIONS, PROJECTS, ACHIEVEMENTS, REFERENCES, CUSTOM), content (JSON).
- `Subscription` — plan (FREE/BASIC/PRO), status, usage counters (resumeCount, aiUsageCount, exportCount, importCount, atsUsageCount).
- `SystemSettings` — per-plan limits, available templates, feature flags (maintenanceMode, photoUploadPlans).

Run `npx prisma generate` after schema changes. Use `npx prisma migrate dev` for schema changes (creates migration files). Use `npx prisma migrate deploy` in production.

## Coding Conventions

### Components
- Functional components with hooks. Client components marked with `'use client'`.
- PascalCase filenames for components (e.g., `ResumeBuilder.tsx`).
- camelCase for utilities and hooks (e.g., `useAutoSave.ts`).
- Props defined via TypeScript interfaces.

### Imports
- Use path alias: `@/lib/...`, `@/components/...`, `@/contexts/...`, `@/types/...`
- Prefer aliased imports over relative paths.

### API Routes
Standard pattern:
```typescript
export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  const limits = await checkUserLimits(userId)
  if (!limits.canUseAI) return NextResponse.json({ error: '...' }, { status: 403 })
  // ... business logic
  return NextResponse.json({ data })
}
```
Always: authenticate → check limits/permissions → execute → update usage counters → return JSON.

### State Management
- `LanguageContext` — i18n with `t()` function, lazy-loaded translations, RTL support.
- `SubscriptionContext` — user plan, permissions (boolean flags), usage counts, refresh method.
- Custom hooks for domain logic (`useAutoSave`, `useAutoTranslation`, `useResumeData`).

### Styling
- Tailwind CSS with HSL CSS variables for theming.
- CVA (`class-variance-authority`) for component variants.
- RTL support for Arabic and Kurdish (document.dir toggling).

### Error Handling
- Try-catch in async operations; user-facing errors via `toast.error()`.
- API errors return `{ error: string }` with appropriate HTTP status codes.

## i18n / Translations

Three languages: English (`en`), Arabic (`ar`), Kurdish Sorani (`ckb`).
- Translation files at `src/locales/{lang}/common.json`.
- English is pre-loaded; Arabic and Kurdish are lazy-loaded.
- Use `t('dotted.key')` or `t('key', { variable: value })` for interpolation.
- Arabic and Kurdish are RTL languages.

## Key Architectural Notes

- **Quota system**: Subscription usage is tracked and enforced at the API level. `checkUserLimits()` in `src/lib/db.ts` is the gatekeeper. `SystemSettings` defines per-plan limits.
- **PDF generation**: Server-side via `@react-pdf/renderer`. Templates are in `src/components/resume-pdf/`. Font registration in `src/lib/pdfFonts.ts` uses local TTF files (not HTTP URLs — HTTP font loading crashes in serverless).
- **Resume import**: DOCX parsed via Mammoth, PDF text extracted via AI. Content is normalized and optionally auto-translated.
- **Auth middleware**: `src/middleware.ts` protects `/dashboard`, `/resume-builder`, `/admin`, `/billing`, `/settings` routes via Clerk.
- **Webhook sync**: Clerk user events sync to the database via `/api/webhooks/clerk` with Svix signature validation.

## Environment Variables

See `.env.example` for required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Auth
- `OPENROUTER_API_KEY` — AI features
- `RESEND_API_KEY` — Email
- `CLERK_WEBHOOK_SECRET` — Webhook validation

## Deployment

- Platform: Netlify
- Build: `npx prisma generate && npm run build`
- Publish dir: `.next`
- Database: PostgreSQL on Neon.tech
- Static assets cached 1 year (immutable); API routes are dynamic.

## No Test Suite

There is currently no testing framework configured. No Jest, Vitest, or similar.
