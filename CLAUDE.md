# work.krd — AI Assistant Guide

## Core Rules
- **Agent teams**: Use for any task involving reading/exploring codebase or implementation (parallelize across folders)
- **Plan first**: For implementation tasks, plan then use agent teams to implement in parallel
- **Update docs**: After every change session, update relevant docs in `docs/` with new learnings before committing
- **Commit only**: Wait for Alan to say "push" — Netlify auto-builds (20 deploys/month limit)
- **Test both**: Mobile AND desktop after CSS changes

## Self-Improvement Rule
After completing a task that took 8+ tool calls, append ONE optimization hint as a comment at the end of your response. Format: "💡 Optimization: [one sentence - reusable skill, memory pattern, or workflow fix]". Skip if the task was exploratory.

## Tech Stack
- **Framework**: Next.js 15 + Tailwind CSS + Prisma (PostgreSQL)
- **Auth**: Clerk
- **Purpose**: Resume builder SaaS for Kurdish/Arabic speakers
- **Critical**: RTL support is mandatory for all UI/templates
- **Languages**: English, Arabic, Central Kurdish (Sorani)

## Project Structure

### Key Directories
```
src/
  app/                          # Next.js pages & API routes
    api/                        # Backend APIs (auth, PDF, admin, ATS, payments)
    resume-builder/             # Resume builder page
    admin/                      # Admin dashboard
    onboarding/                 # User onboarding wizard
    billing/                    # Billing & payment pages
  components/
    html-templates/             # Resume templates + shared components
    resume-builder/             # Builder UI (form, preview, ATS)
    admin/                      # Admin panel components
    landing/                    # Landing page sections
  lib/                          # Shared utilities
    pdf/                        # PDF generation (fonts, render, puppeteer)
  contexts/                     # React contexts (Language, Subscription)
  hooks/                        # Custom hooks (auto-save, download, etc.)

docs/                           # Detailed documentation (see References below)
public/
  fonts/                        # Inter + Noto Sans Arabic (base64 embedded)
  thumbnails/                   # Template SVG thumbnails (300×400)
```

### Core Files
- `src/lib/db.ts` — User management, limits checking, resume operations
- `src/lib/templates.ts` — Template metadata and registry
- `src/lib/rtl.ts` — RTL text detection (Arabic/Kurdish)
- `src/lib/admin-utils.ts` — Admin shared utilities (date formatting, devError)
- `src/components/html-templates/registry.tsx` — Template registry

## Quick Reference

### A4 Dimensions
- Width: `794px` (210mm at 96dpi)
- Height: `1123px` (297mm at 96dpi)
- Default padding: `60px`
- Content per page: `1043px` (1123 - 40 top - 40 bottom)

### Plans
- FREE, BASIC, PRO
- `-1` = unlimited (for PRO limits)
- Limits stored in `SystemSettings` DB table (singleton row)

### Template Requirements
- `width: '794px'`, NO `minHeight` on root
- RTL support: use `isRTLText()` from `@/lib/rtl`
- Page breaks: `.resume-entry` on atomic items, `.resume-section` on wrappers
- Thumbnails: REQUIRED at `public/thumbnails/{id}.svg` (300×400 viewBox)

## References

Detailed documentation organized by topic:

- **`docs/architecture.md`** — System architecture, features, file map
  - Template system, resume builder, subscriptions, admin dashboard
  - All features: onboarding, landing page, ATS, payments, duplicate
  - Detailed file locations and component structure

- **`docs/template-guide.md`** — Creating resume templates
  - Step-by-step template creation
  - Mandatory rules (dimensions, RTL, page breaks)
  - Two-column template checklist (avoid common mistakes)
  - PDF pipeline (React SSR, fonts, Puppeteer, preview pagination)

- **`docs/admin-patterns.md`** — Admin panel development
  - Shared utilities, auth patterns, API route checklist
  - Component patterns, data loading, pagination, lists
  - Modal patterns, keyboard shortcuts, settings management
  - Dark mode, analytics, audit trail

- **`docs/api-patterns.md`** — Backend conventions
  - Rate limiting, error handling, validation (Zod)
  - Atomic operations (race-condition safe)
  - Response formats, cache control, timeouts
  - Auth helpers, transactions, CSRF protection
  - Prisma patterns, upload handling, external APIs

- **`docs/audit-learnings.md`** — Gotchas & lessons learned
  - Prisma patterns (Json fields, template access)
  - Hydration issues (Date/random in useState)
  - CSS & layout gotchas (minHeight, @page margins, RTL flex)
  - RTL & i18n pitfalls, auto-save stale closures
  - Mobile/WSL dev, admin hardening, payment gotchas

- **`docs/i18n-guide.md`** — Internationalization
  - Translation structure (en/ar/ckb)
  - RTL support (detection, direction, layout, mixed content)
  - Date/number formatting for locales
  - AI token limits for Kurdish
  - Component patterns, accessibility

## Common Commands

### Development
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint check
```

### Prisma
```bash
npx prisma db push       # Push schema changes to DB
npx prisma generate      # Generate Prisma Client
npx prisma studio        # Open Prisma Studio (DB GUI)
```

**Note**: Run from Windows terminal (not WSL) when DATABASE_URL is Windows-configured.

## Critical Gotchas

1. **Prisma Json fields**: Pass arrays directly, NEVER `JSON.stringify()` (causes double-encoding)
2. **Template minHeight**: NO `minHeight` on root container (breaks page count)
3. **RTL flex**: Use `flexDirection: 'row'` — NOT `'row-reverse'` (double-reverses back to LTR)
4. **Hydration**: Never `Date.now()` or `Math.random()` in `useState` initializers
5. **Button type**: Always `type="button"` unless intended as form submit
6. **RTL detection**: Import `isRTLText` from `@/lib/rtl` — never duplicate the regex
7. **Template thumbnails**: REQUIRED for every template at `public/thumbnails/{id}.svg`

## Need More Detail?

Check the `docs/` directory files referenced above. Each covers a specific domain in depth.
