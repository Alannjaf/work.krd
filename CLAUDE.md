# work.krd — AI Learnings

## Rules
- For any task involving reading/exploring the codebase, use agent teams to parallelize across folders
- For implementation, plan first then use agent teams to implement in parallel
- After every change session, update this CLAUDE.md with new learnings, patterns, gotchas, and architecture changes before committing
- Commit only, wait for Alan to say "push" — Netlify auto-builds (20 deploys/month)
- Test mobile AND desktop after CSS changes

## Self-Improvement Rule
After completing a task that took 8+ tool calls, append ONE optimization hint as a comment at the end of your response. Format: "💡 Optimization: [one sentence - reusable skill, memory pattern, or workflow fix]". Skip if the task was exploratory.

## Tech Stack
- Next.js 15 + Tailwind + Prisma (PostgreSQL) + Clerk auth
- Resume builder SaaS for Kurdish/Arabic speakers — RTL is critical
- A4 target: `width: 794px` (210mm at 96dpi), default `padding: 60px`
- A4 page height: `1123px` (297mm at 96dpi), content per page: `1043px` (1123 - 40px top - 40px bottom)

## Architecture Overview

### Template System
- **Registry** (`src/components/html-templates/registry.tsx`): Maps template IDs to `{ id, name, component }` entries
- **Current templates**: `placeholder` (fallback), `modern` (Modern Professional — dark sidebar + yellow accent), `elegant` (Elegant Dark — both columns dark + gold accents), `bold` (Bold Creative — dark sidebar + white main, skill bars, HELLO greeting), `developer` (Developer — dark IDE theme with green syntax accents), `creative` (Creative — deep indigo sidebar #2D2B55 + coral accent strip, SVG circular skill rings, colored progress bars for languages, multi-color card system: coral=experience, yellow=education, mint=projects, lavender=certifications, diamond dividers)
- **Shared components** in `src/components/html-templates/shared/`: ResumeHeader, ContactInfo, ProfilePhoto, SectionTitle, ExperienceSection, EducationSection, SkillsSection, LanguagesSection, ProjectsSection, CertificationsSection, Watermark
- **Metadata** (`src/lib/templates.ts`): `getAllTemplates()`, `getTemplateIds()`, `getTemplateTier()`
- **Crop configs** (`src/lib/template-config.ts`): Per-template profile photo crop settings

### Resume Builder (3-Column Layout)
- **Page**: `src/app/resume-builder/page.tsx` — Desktop: sidebar icons + form + live preview; Mobile: single-column + FAB
- **6 Sections**: About You → Summary → Experience → Education → Skills & Languages → Additional (Projects + Certifications)
- **Auto-save**: `useAutoSave.ts` — refs pattern (avoids stale closures), 1s debounce, always full saves (not patches)
- **Download**: `useDownloadPDF.ts` → POST `/api/pdf/generate` with `action: 'download'`; 403 → opens `/billing`
- **Template switcher**: Popover in preview panel, checks `availableTemplates` from SubscriptionContext

### Subscription & Limits
- **Plans**: FREE, BASIC, PRO — limits in `SystemSettings` DB table (singleton row)
- **`-1` = unlimited** for PRO defaults (resumes, AI, exports, imports, ATS)
- **`checkUserLimits()`** in `db.ts`: Server-side gate for all features, PRO always gets all registered templates
- **SubscriptionContext** (`src/contexts/SubscriptionContext.tsx`): Client-side provider, fetches from `/api/user/subscription-data`
- **Template access**: `freeTemplates`, `basicTemplates`, `proTemplates` arrays in SystemSettings (Prisma Json fields — pass arrays directly, never JSON.stringify)

### Admin Dashboard
- **Components** in `src/components/admin/`: AdminDashboard, AdminStatsCards, AdminSubscriptionStatus, AdminSystemSettings, AdminQuickActions, UserManagement, ResumeManagement, PaymentItem, PaymentList, PaymentApprovalForm, AdminAnalytics, DeleteConfirmModal, AuditLogPanel, AdminErrorBoundary, AdminThemeToggle
- **Layout**: `src/app/admin/layout.tsx` — wraps all admin pages with skip-to-content link, theme toggle (fixed top-right), flash prevention script (reads localStorage synchronously before paint)
- **Dark mode**: `darkMode: 'class'` in tailwind.config.js. `AdminThemeToggle` toggles `.dark` on `<html>`, persists to `localStorage('admin-theme')`. shadcn components (Card, Button, Input, Badge) auto-adapt via CSS variables in globals.css `.dark` block. Non-shadcn elements need manual `dark:` variants (bg-gray-50→dark:bg-gray-900, text-gray-900→dark:text-gray-100, border-gray-200→dark:border-gray-700)
- **Settings API**: GET/POST `/api/admin/settings` — singleton SystemSettings record, POST validated with Zod schema (partial updates supported). Auto-snapshots settings before each save (last 5 kept)
- **Settings history**: GET/POST `/api/admin/settings/history` — list last 5 snapshots / revert to a snapshot. `SettingsSnapshot` Prisma model stores JSON data + savedBy + createdAt
- **Settings cache**: `getSystemSettings()` has 5-min TTL in-memory cache, invalidated by `invalidateSettingsCache()` on POST save
- **Analytics**: GET `/api/admin/analytics` — 12-month time-series via raw SQL (signups, revenue, active users, resumes). `AdminAnalytics` component renders 4 Recharts charts (2 line + 2 bar)
- **Subscription check**: GET (status) / POST (process expired → downgrade to FREE) `/api/subscriptions/check-expired`
- **Stats API**: Revenue uses dynamic `proPlanPrice` from SystemSettings (not hardcoded)
- **Payment review**: Approve/reject inside `$transaction` with PENDING check (race-condition safe), note max 1000 chars. Refund button on APPROVED payments (POST `/api/admin/payments/[id]/refund`) marks as REFUNDED + downgrades user to FREE
- **PaymentStatus enum**: PENDING, APPROVED, REJECTED, REFUNDED — PaymentList has filter tabs for all 4 statuses + date range filter (dateFrom/dateTo)
- **Admin auth** (`lib/admin.ts`): `isAdmin()` returns false for non-admins, throws on DB errors (callers handle 500 vs 403). `logAdminAction()` writes to `AdminAuditLog` table
- **Dashboard data loading**: Uses `Promise.allSettled()` for parallel fetch of stats + settings + subscription status, with per-section error state UI + retry
- **Dashboard flow**: Stats Cards → Analytics → Subscription Status → System Settings → Quick Actions → Recently Viewed → Audit Log
- **Keyboard shortcuts**: `/` focuses search, `?` toggles shortcuts help panel (AdminDashboard). Escape closes modals (UserManagement, PaymentApprovalForm, DeleteConfirmModal)
- **Recently viewed**: `useRecentlyViewed` hook (`src/hooks/useRecentlyViewed.ts`) — localStorage-based, tracks last 10 admin items (users/resumes/payments), shown in AdminDashboard
- **AdminSystemSettings**: Dirty state tracking, "Saved!" toast on success (auto-dismiss 3s), history panel with restore buttons, tooltip hints on limit inputs (`cursor-help`)
- **AdminStatsCards**: Loading skeleton with animated pulse bars (including sub-stats for Payments card)
- **UserManagement**: Server-side pagination (20/page), search (debounced 500ms), plan filter (FREE/PRO), date range filter, bulk actions (upgrade/downgrade/delete), CSV export — uses `Pagination` component from `@/components/ui/Pagination`
- **AuditLogPanel**: Server-side pagination (20/page), action type filter (8 actions), date range filter, CSV export. API at `/api/admin/audit-log` supports `?action=&dateFrom=&dateTo=&page=&limit=`
- **Bulk user API**: POST `/api/admin/users/bulk` — supports `upgrade`, `downgrade`, `delete` actions. Skips admin users on delete. Processes in Prisma transaction, logs to audit trail
- **aria-live**: `aria-live="polite"` on AdminDashboard error banner for screen reader announcements
- **AdminPayments refactored**: Split into `PaymentItem.tsx` (single card + shared types/helpers), `PaymentList.tsx` (list + filters + pagination), `PaymentApprovalForm.tsx` (review modal). `AdminPayments.tsx` is now a thin wrapper (AppHeader + PaymentList)
- **ResumeTable**: Sortable column headers (opt-in via `sortBy`/`sortOrder`/`onSort` props, defaults to client-side sort). Column visibility toggle dropdown (Columns3 icon). API already supports `sortBy` + `sortOrder` query params
- **DeleteConfirmModal**: Reusable modal with warning icon, item details, "cannot be undone" text, red delete button, Escape key, focus-on-cancel. Used by ResumeManagement (replaces native `confirm()`)
- **All admin lists use server-side pagination**: Users (20/page), Payments (20/page), Resumes (10/page) — all APIs return `hasNextPage`/`hasPrevPage` in response
- **Pagination constants**: `ADMIN_PAGINATION` in `src/lib/constants.ts` — `{ PAYMENTS: 20, RESUMES: 10, USERS: 20, AUDIT_LOGS: 20, MAX_LIMIT: 100 }`
- **CSV export pattern**: Build CSV string with proper escaping (double quotes), create Blob, trigger download via temporary anchor element. Used in UserManagement and AuditLogPanel
- **Naming convention**: No semicolons, single quotes for JS strings (double quotes OK in JSX attributes). All admin components follow this convention
- **TypeScript strict**: No `any` in admin code — use `Prisma.PaymentWhereInput`, `Prisma.InputJsonValue`, `Record<string, unknown> | object | unknown[]` for response data
- **Gotcha**: Admin pages have NO i18n — all hardcoded English. Needs `pages.admin.*` i18n namespace (~100+ keys) for multilingual support
- **Gotcha**: Prisma schema changes (like adding enum values) need `npx prisma db push` + `npx prisma generate` from Windows terminal (not WSL) when DATABASE_URL is configured there

## Creating New Templates

### Step-by-Step
1. Create `src/components/html-templates/{Name}Template.tsx` implementing `HtmlTemplateProps`
2. Register in `registry.tsx`: add to `templateRegistry` object
3. Add metadata in `templates.ts`: `getAllTemplates()` array
4. Optionally add crop config in `template-config.ts`
5. **REQUIRED**: Create thumbnail SVG at `public/thumbnails/{id}.svg` (300×400 viewBox) — must match the template's actual colors, layout, and accent elements. TemplateSwitcher loads these via `<img src={/thumbnails/${id}.svg}>` into 72×96 boxes

### Template Props
```typescript
interface HtmlTemplateProps {
  data: ResumeData    // personal, summary, experience, education, skills, languages, projects?, certifications?
  watermark?: boolean // render <Watermark /> overlay when true
}
```

### ResumeData Structure
```
personal: { fullName, email, phone, location, linkedin, website, title, profileImage, dateOfBirth, gender, nationality, maritalStatus, country }
summary: string
experience: [{ jobTitle, company, location, startDate, endDate, current, description (HTML) }]
education: [{ degree, field, school, location, startDate, endDate, gpa, achievements (HTML) }]
skills: [{ name, level? }]
languages: [{ name, proficiency }]
projects?: [{ name, description (HTML), technologies, link, startDate, endDate }]
certifications?: [{ name, issuer, date, expiryDate, credentialId, url }]
```

### Mandatory Template Rules (ALL templates)

**Dimensions**: `width: '794px'`, NO `minHeight` on root container

**Font**: `fontFamily: 'system-ui, -apple-system, sans-serif'` (PDF pipeline injects Inter + Noto Sans Arabic)

**RTL Support** (MANDATORY):
```js
// Detect: use isRTLText() from '@/lib/rtl' — never duplicate the regex
// Root: direction: isRtl ? 'rtl' : 'ltr'
// Text blocks: textAlign: isRtl ? 'right' : 'left'
// Flex containers: use flexDirection: 'row' (NOT 'row-reverse' for RTL!)
//   — direction: rtl on root already reverses flex row order
//   — adding row-reverse DOUBLE-REVERSES back to LTR layout
// Contact/URLs: <span style={{ unicodeBidi: 'isolate' }}> inside direction:'ltr', unicodeBidi:'plaintext' container
// Line-height: increase for RTL (1.5-1.8 vs 1.3-1.5 LTR)
```

**Page Break CSS** (include via `<style>` in template):
```css
.resume-entry { break-inside: avoid; page-break-inside: avoid; }
.resume-section h2 { break-after: avoid; page-break-after: avoid; }
```

**resume-entry granularity** (CRITICAL — gets page breaks right the first time):
- `className="resume-entry"` goes on the **smallest atomic item** that shouldn't be split: one experience entry, one skill line, one contact field, one demographic field, one language line
- NEVER put `resume-entry` on a section wrapper that contains multiple items — the break algorithm will push the entire section to the next page, wasting space
- `className="resume-section"` goes on the outer section container (Experience, Education, etc.) — its `h2` gets `break-after: avoid` to stay with content

**List Styles** (Tailwind strips bullets, include via `<style>`):
```css
.resume-desc ul, .resume-desc ol { list-style: disc; padding-left: 1.2em; margin: 4px 0; }
.resume-desc ol { list-style: decimal; }
[dir="rtl"] .resume-desc ul, [dir="rtl"] .resume-desc ol { padding-left: 0; padding-right: 1.2em; }
```

**Rich text**: `dangerouslySetInnerHTML={{ __html: description }}` with `className="resume-desc"`

**Watermark**: `{watermark && <Watermark />}` — import from shared components

### Two-Column Template Checklist (sidebar + main content)

Follow this EXACTLY to avoid the multi-iteration mistakes made on ModernTemplate:

**1. Sidebar background (PDF — edge-to-edge on every page)**:
```jsx
// In <style> tag:
.sidebar-bg { display: none; }
@media print {
  .sidebar-bg {
    display: block !important;
    position: fixed !important;
    top: 0 !important; bottom: 0 !important;
    ${isRtl ? 'right' : 'left'}: 0;
    width: ${SIDEBAR_WIDTH}px;
    background-color: ${SIDEBAR_BG};
    z-index: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
// Then render: <div className="sidebar-bg" />
```

**2. Sidebar background (Preview — `--resume-page-bg` variable)**:
```jsx
// On root div, use percentage-based gradient stops (scales with page card):
'--resume-page-bg': isRtl
  ? `linear-gradient(to left, ${ACCENT} 0.756%, ${SIDEBAR_BG} 0.756%, ${SIDEBAR_BG} 35.265%, #ffffff 35.265%)`
  : `linear-gradient(to right, ${ACCENT} 0.756%, ${SIDEBAR_BG} 0.756%, ${SIDEBAR_BG} 35.265%, #ffffff 35.265%)`
// Calculate percentages: accentWidth / 794 * 100, sidebarWidth / 794 * 100
```

**3. Per-page content padding (`box-decoration-break: clone`)**:
```jsx
// On BOTH sidebar and main content divs:
{ padding: '40px 24px', WebkitBoxDecorationBreak: 'clone' as const, boxDecorationBreak: 'clone' as const }
// This repeats padding on every page fragment — no content touching page edges
```

**4. Page break classes (granular — one per atomic item)**:
```jsx
// Section wrapper (Experience, Education, etc.):
<div className="resume-section" style={{ marginBottom: 24 }}>
  <MainSectionTitle>Experience</MainSectionTitle>
  {data.experience.map(exp => (
    <div key={exp.id} className="resume-entry" style={{ marginBottom: 16 }}>  // ← each entry
      ...
    </div>
  ))}
</div>

// Sidebar items — EACH field is its own resume-entry:
<div style={{ marginBottom: 24 }}>  // ← section wrapper has NO resume-entry
  <SidebarSectionTitle>Contact</SidebarSectionTitle>
  {data.personal.email && (
    <div className="resume-entry" style={{ marginBottom: 10 }}>  // ← individual field
      <div>Email</div>
      <div>{data.personal.email}</div>
    </div>
  )}
  // ... same for phone, location, etc.
</div>
```

**5. Flex layout with RTL**:
```jsx
// IMPORTANT: use flexDirection: 'row' — NOT 'row-reverse' for RTL!
// The root div's direction: rtl already reverses flex row order.
// Using row-reverse + direction:rtl = double-reversal = sidebar stays on LEFT (wrong!)
<div style={{ display: 'flex', flexDirection: 'row', position: 'relative', zIndex: 1 }}>
  <div style={{ width: SIDEBAR_WIDTH, ... }}>  {/* sidebar — auto-flips to right in RTL */}
  <div style={{ flex: 1, ... }}>                {/* main content */}
</div>
// Same for section title flex containers — just use flexDirection: 'row'
```

**6. DO NOT**:
- Add `@page` rules in template CSS (handled by `renderHtml.ts`)
- Add `minHeight` on root container (breaks page count)
- Use `html { background }` for print backgrounds (Chromium doesn't propagate to page canvas)
- Remove `@page { margin: 0 }` from renderHtml.ts (clips `position: fixed` elements)
- Wrap entire sidebar sections in `resume-entry` (causes cascading break algorithm to waste space)
- Assume page break convergence works the same for sidebar and main content — sidebar entries are dense and cascade badly; ResumePageScaler skips them in Phase 2 re-convergence
- Use `flexDirection: isRtl ? 'row-reverse' : 'row'` — the root `direction: rtl` already reverses flex rows, so `row-reverse` double-reverses back to LTR
- Duplicate RTL detection regex — always import `isRTLText` from `@/lib/rtl`
- Skip creating a thumbnail SVG — every template MUST have `public/thumbnails/{id}.svg` (300×400) with accurate colors/layout

## PDF Pipeline
- `renderHtml.ts`: React SSR → full HTML document with embedded fonts (Inter LTR + Noto Sans Arabic RTL via base64)
- `generatePdf.ts`: Puppeteer (`puppeteer-core`) → A4 PDF; waits for `document.fonts.ready`
- Page margins: `@page { size: A4; margin: 0; }` in `renderHtml.ts` — zero margin so `position: fixed` backgrounds extend edge-to-edge
- Content spacing handled by template padding + `box-decoration-break: clone` on sidebar/main divs — padding repeats on every page fragment (Chrome 130+)
- Puppeteer `margin: { top: 40px, bottom: 40px }` in `generatePdf.ts` — overridden by @page but kept as fallback
- Templates must NOT add their own `@page` margin overrides
- For two-column templates with sidebar backgrounds: use `position: fixed` div in `@media print` (repeats every page with @page margin:0). Preview uses `--resume-page-bg` CSS variable read by ResumePageScaler.
- Preview pagination: `ResumePageScaler.tsx` measures content, calculates page breaks matching Puppeteer output

## Resume Duplicate Feature
- **`duplicateResume()`** in `db.ts`: Takes `resumeId`, `userId`, `clerkId` — checks limits, copies resume + all sections atomically via `$transaction`, increments `resumeCount`
- **API**: POST `/api/resumes/[id]/duplicate` — returns new resume; 403 if limit reached, 404 if not found
- **Dashboard**: Copy button (blue) between Edit and Delete icons, `duplicatingId` state pattern mirrors `deletingId`
- **Template fallback**: If user's plan can't access the original's template, copy uses `'modern'`
- **i18n keys**: `pages.dashboard.resumes.actions.duplicateResume`, `pages.dashboard.resumes.messages.duplicateSuccess`, `pages.dashboard.resumes.messages.duplicateLimitReached`

## Admin Shared Utilities
- **`src/lib/admin-utils.ts`**: Shared admin utilities
  - `formatAdminDate(date)` — relative time for recent (<7d: "Just now", "5m ago", "3h ago", "2d ago"), ISO `YYYY-MM-DD` for older
  - `formatAdminDateFull(date)` — full ISO datetime `YYYY-MM-DD HH:MM` for title/tooltip attributes
  - `devError(...args)` — `console.error` gated behind `NODE_ENV !== 'production'`, tree-shaken in prod builds
- **All admin components use `devError`** instead of `console.error` (18 call sites migrated)
- **All admin dates use `formatAdminDate`** with `title={formatAdminDateFull(...)}` for hover tooltips
- **PaymentItem.tsx** exports `formatDate` as alias for `formatAdminDate` (backwards compat for PaymentApprovalForm import)

## Key Patterns & Gotchas
- **Prisma Json fields**: Pass arrays directly (`proTemplates: ['modern']`), never `JSON.stringify()` — causes double-encoding
- **PRO template access**: `checkUserLimits` always includes all `getTemplateIds()` for PRO, regardless of DB settings
- **Export tracking**: Only `action: 'download'` increments `exportCount`; preview doesn't count
- **Two getSystemSettings()**: Private one in `db.ts` (parses JSON arrays, used by `checkUserLimits`) and exported one in `system-settings.ts` (raw Prisma result, used by admin API). The exported one has 5-min TTL cache
- **Subscription expiry**: Manual via admin button, not scheduled — downgrades to FREE, preserves usage counts
- **Auto-save refs pattern**: `formDataRef`, `resumeIdRef`, `templateRef` — prevents stale closures in debounced saves
- Buttons without `type="button"` cause page refresh
- `minHeight: 1123px` on template root causes wrong page count (remove it)
- `@page { margin: X }` clips `position: fixed` elements — must use `@page { margin: 0 }` (see Two-Column Checklist)
- `html { background }` does NOT propagate to print page canvas in Chromium — don't try it, use `position: fixed` instead
- **Preview break algorithm** (`ResumePageScaler.tsx`): Column-aware 2-phase approach:
  - Phase 1: Converge ALL entries (sidebar + main) — stable base break
  - Phase 2: Fix heading orphans (heading on page but `firstEntryTop >= adjustedEnd`), re-converge ONLY main-content entries (skip sidebar via `isSidebar` flag)
  - `isSidebar` determined by horizontal center position < 40% of content width
  - **Why column-aware**: Sidebar entries (e.g., skill rings) are densely packed → cascading re-convergence pushes break far back, wasting page space. Skipping sidebar in Phase 2 prevents this cascade while keeping main content sections grouped with their headings
- Mixed LTR/RTL text garbles → use `unicode-bidi: isolate` spans
- AI max_tokens 200 cuts Kurdish text → use 500+ (Kurdish uses more tokens/word)
- Mobile toolbar → flex-wrap, smaller icons (no horizontal scroll)
- **Hydration**: Never use `new Date()`, `Date.now()`, or `Math.random()` in `useState` initializers — they differ server vs client. Use empty default + `useEffect` to set client-only values
- **Dev mobile testing (WSL)**: Access via `http://<WSL_IP>:3000`. Requires `allowedDevOrigins` in `next.config.js` for Next.js 15.3+ (validates Host header). Chunk load errors → `error.tsx` auto-reloads on `ChunkLoadError`
- **WSL Prisma dll lock**: `prisma generate` fails when a Windows process (Next dev server, Cursor) holds `query_engine-windows.dll.node`. Workaround: temporarily remove `"windows"` from `binaryTargets` in schema, run generate, restore schema: `sed -i 's/"windows", //' prisma/schema.prisma && npx prisma generate && git checkout prisma/schema.prisma`
- **Admin audit pattern**: When adding new admin API routes, always include: `requireAdminWithId()`, `rateLimit()`, CSRF validation on POST/DELETE, `devError()` not `console.error`, `logAdminAction()` for mutations

## Onboarding Wizard
- **3-step flow**: Welcome+Name → Template Picker → Upload CV or Start from Scratch
- **Guard logic**: Dashboard checks `resumeCount === 0` + `onboardingCompleted === false` → redirects to `/onboarding`. Onboarding page checks if already completed → redirects to `/dashboard`
- **Clerk webhook race**: The onboarding-status API returns `userNotFound: true` if the webhook hasn't created the DB user yet — the page retries after 2s
- **Routing**: `signUpForceRedirectUrl="/onboarding"` in layout.tsx, `signInForceRedirectUrl="/dashboard"` (existing users go to dashboard)
- **Template picker**: Uses SVG thumbnails from `public/thumbnails/{id}.svg` rendered large (no subscription gating during onboarding)
- **Upload flow**: Reuses existing `/api/resume/upload` endpoint. Free users get 1 import (`maxFreeImports: 1`)
- **Onboarding-complete API**: Creates resume via `createResume()`, optionally populates sections from CV data in a `$transaction`, sets `user.onboardingCompleted = true`
- **Skip**: Sets `onboardingCompleted = true` without creating a resume — user goes to dashboard and never sees onboarding again
- **i18n keys**: `pages.onboarding.*` in all 3 locales (en, ar, ckb) — ~15 keys covering all 3 steps + errors
- **Mobile-first**: Full-width cards, stacked vertically, `max-w-lg` for steps 1/3, `max-w-4xl` for step 2 (template grid)

## Landing Page
- **Components** in `src/components/landing/`: header, hero, templates (NEW), how-it-works, features, pricing, final-cta (NEW), footer
- **Removed sections**: about.tsx, contact.tsx — deleted in homepage redesign
- **Page structure** (`src/app/page.tsx`): Header → Hero → Templates → HowItWorks → Features → Pricing → FinalCTA → Footer
- **Hero**: Left text + right resume preview cards (SVG thumbnails), fade-in animation, trust line with real user count from `/api/stats/public`
- **Templates section**: 5 template thumbnail grid (modern, elegant, bold, developer, creative) with hover effects
- **How It Works**: 3 steps (Choose Template → Fill Details → Download PDF) with connecting line on desktop
- **Features grid**: 6 items (AI, ATS, Multilingual, Mobile, PDF, Pro Templates) in 2x3 grid
- **Pricing**: Free vs Pro (5,000 IQD/month) cards, Pro highlighted with "Most Popular" badge
- **FinalCTA**: Blue gradient section with "Ready to Land Your Dream Job?" + CTA button
- **Footer**: Minimal — logo text, tagline, privacy/terms links, language switcher, copyright
- **Scroll animations**: CSS `transition-all` + IntersectionObserver (no framer-motion), staggered delays via `transitionDelay`
- **Public stats API** (`/api/stats/public`): No auth required, returns `{ resumeCount, userCount }`, 5min `s-maxage` cache
- **i18n keys**: All under `pages.home.*` namespace (hero, templates, howItWorks, features, pricing, finalCta, footer)
- **Nav keys**: Added `nav.templates` and `nav.howItWorks` to all 3 locales
- **Header**: Sticky, transparent→white on scroll, language switcher dropdown, Clerk auth buttons, mobile hamburger menu
- **RTL**: Arrow icons flip via `isRTL ? 'rotate-180' : ''`, language dropdown positioned with `isRTL ? 'left-0' : 'right-0'`, floating cards position swaps
- **No framer-motion** — all animations are pure CSS transitions + IntersectionObserver

## ATS Feature
- **Shared utilities**: `src/lib/ats-utils.ts` — `stripHtml()`, `buildResumeText()`, Zod `resumeDataSchema`, `ATS_AI_CONFIG` (env vars), `withTimeout()`, `ATS_SCORE_THRESHOLDS`, `MAX_REQUEST_SIZE`
- **Routes**: `src/app/api/ats/score/route.ts` and `src/app/api/ats/keywords/route.ts`
- **Rate limited**: 10 requests/60s per userId+IP (authenticated), uses `rateLimit()` from `@/lib/rate-limit`
- **Atomic limit enforcement**: Increment happens BEFORE AI call — prevents wasted API calls on race conditions. Uses `prisma.subscription.updateMany` with `where: { atsUsageCount: { lt: limit } }` — if `result.count === 0`, limit was reached concurrently
- **Unlimited plans** (`atsLimit === -1`): Just increment normally, skip atomic check
- **Zod validation**: Both routes validate `resumeData` shape via `resumeDataSchema.safeParse()` before processing
- **Request size limit**: 1MB max (checked via Content-Length header)
- **AI timeout**: 30s default via `Promise.race` wrapper (`withTimeout()`), configurable via `ATS_AI_TIMEOUT_MS` env var
- **Error sanitization**: API routes never expose `error.message` to client — always generic messages. `console.error` in catch blocks for server-side logging
- **Max job description**: 10,000 characters (keywords route only)
- **AI config env vars**: `ATS_AI_MODEL`, `ATS_AI_TEMPERATURE`, `ATS_SCORE_MAX_TOKENS`, `ATS_KEYWORDS_MAX_TOKENS`, `ATS_AI_TIMEOUT_MS`
- **i18n keys**: `pages.resumeBuilder.ats.*` — ~40 keys covering title, tabs, score, keywords, importance badges, upgrade, toasts. NO duplicate keys at `resumeBuilder.ats.*` (removed)
- **Frontend**: Split into 3 files:
  - `ATSOptimization.tsx` — Modal wrapper with accessibility (aria-modal, escape key, focus trap), usage update callback, client-side result caching (invalidates on resume change)
  - `ats/ScoreTab.tsx` — Score analysis tab with loading skeleton, score color constants from `ATS_SCORE_THRESHOLDS`
  - `ats/KeywordsTab.tsx` — Keyword matching tab with loading skeleton, default importance badge case, label/htmlFor association
- **Usage update**: `onUsageUpdate` callback prop → `refreshSubscription()` in page.tsx — keeps subtitle count fresh after each analysis
- **General issues**: Edit CTA disabled for `section: "general"` items (no misleading navigation)
- **Header button**: `BuilderHeader.tsx` — `ScanSearch` icon + always-visible "ATS" label (emerald color accent to distinguish from gray ghost buttons), uses `t('pages.resumeBuilder.actions.ats')` for label
- **AI prompts**: Multilingual awareness (English/Arabic/Kurdish), semantic keyword matching across languages, don't penalize non-English resumes. Score prompt has calibration ranges (90-100/70-89/50-69/<50), optional `targetRole` param, keyword density criterion. Keywords prompt sends ALL resume sections (not just 4), has importance categorization rules (critical/important/nice-to-have)

## Completion Progress Bar
- **Component**: `src/components/resume-builder/layout/CompletionProgressBar.tsx`
- **Placement**: Between header and main content in `BuilderShell` (new `progressBar` slot)
- **Calculation**: Average of 6 section completions from `useSectionCompletion` hook (0-100%)
- **Color thresholds**: <30% red, 30-69% amber, 70-99% blue, 100% green (text + bar gradient)
- **Encouraging messages**: 5 tiers (0%, 1-29%, 30-69%, 70-99%, 100%) via i18n keys `pages.resumeBuilder.completion.*`
- **Section dots**: Desktop only (`hidden sm:flex`), clickable, ring on active section — redundant with mobile bottom nav dots
- **Mobile**: Compact view (percentage + bar only), text/dots hidden
- **i18n keys**: `pages.resumeBuilder.completion.{label,getStarted,goodStart,gettingThere,almostDone,complete}` in en/ar/ckb

## Quick-Start Resume Templates
- **Data**: `src/lib/quick-start-templates.ts` — 5 role-based pre-filled resume data sets
- **Templates**: `software-engineer`, `marketing-sales`, `fresh-graduate`, `business-management`, `creative-design`
- **Picker UI**: `src/components/resume-builder/QuickStartPicker.tsx` — modal with accessible focus trap, i18n, mobile-responsive grid
- **Integration points**:
  - **Onboarding step 3**: Third card "Start from template" alongside Upload CV and Start from scratch → opens QuickStartPicker → submits formData to onboarding-complete API
  - **Resume builder**: Auto-shows QuickStartPicker when creating a new resume (no URL `id` param) → populates form data + triggers auto-save
- **Data merging**: Template data's `fullName` is always overridden with the user's actual name
- **IDs**: All template item IDs use `qs_` prefix (e.g., `qs_se_exp_1`) to avoid conflicts
- **i18n keys**: `pages.resumeBuilder.quickStart.*` (title, subtitle, startBlank, templates.{id}.name/description) + `pages.onboarding.step3.templateCard.*` in en/ar/ckb
- **Template content**: English only (users will replace with their own info)

## Manual Payment System (FIB)
- **Flow**: User selects plan → `/billing/payment-instructions?plan=pro` → 4-step wizard (plan details → FIB transfer instructions → screenshot upload → success) → `/api/payments/submit` → Telegram notification → admin reviews at `/admin/payments`
- **DB model**: `Payment` table with `Bytes` field for screenshot binary storage, `PaymentStatus` enum (PENDING/APPROVED/REJECTED)
- **Telegram notification**: Non-blocking `sendPhoto` via Bot API; env vars `TELEGRAM_BOT_TOKEN` + `TELEGRAM_ADMIN_CHAT_ID`
- **Admin review**: GET `/api/admin/payments/[id]/review` returns base64 screenshot data URL; POST approve (atomic `$transaction`: update payment + upsert subscription with 30-day endDate) or reject
- **Payment status API**: GET `/api/payments/status` returns `{ payments: [...] }` array sorted by createdAt desc; billing page extracts latest payment for banner
- **Duplicate payment guard**: Submit API checks for existing PENDING payment before creating new one
- **Subscription upgrade on approve**: Upsert subscription with `plan`, `paymentMethod: 'FIB'`, `paymentId`, 30-day `endDate`
- **i18n keys**: `billing.pay.*` (payment instructions page), `billing.pay.wizard.*` (wizard step titles/subtitles/nav), `billing.paymentStatus.*` (billing page banners), `billing.howItWorks.*`, `billing.freePlan.feature1-5`, `billing.proPlan.feature1-8`
- **Payment wizard**: 4-step onboarding-style flow with ProgressDots, fade transitions (goToStep pattern from onboarding page), mobile-first (max-w-lg, h-12 buttons)
- **Phone number**: `0750 491 0348` (Alan Ahmed) — NO QR code (removed `qrcode.react` dependency)
- **Screenshot storage**: `Bytes` field in Prisma = `Buffer` in Node.js; convert to base64 data URL for admin preview
- **Gotcha**: `perMonth` locale values must NOT include leading `/` — the code adds it: `/{t('billing.proPlan.perMonth')}`

## File Map
```
src/components/html-templates/
  registry.tsx                 # Template registry + getHtmlTemplate()
  PlaceholderTemplate.tsx      # Fallback single-column template
  ModernTemplate.tsx           # Dark sidebar + yellow accent two-column
  ElegantTemplate.tsx          # Both-dark columns + gold accents two-column
  BoldTemplate.tsx             # Dark sidebar + white main, skill bars, HELLO greeting
  DeveloperTemplate.tsx          # Dark IDE theme with syntax highlighting accents
  CreativeTemplate.tsx           # Deep indigo sidebar, circular skill rings, progress bars, multi-color cards
  TemplateRenderer.tsx         # Wrapper: looks up registry, renders component
  ResumePageScaler.tsx         # Browser preview with page break simulation
  shared/                     # Reusable template building blocks (13 components)

src/lib/
  templates.ts                # Template metadata (getAllTemplates, getTemplateIds, getTemplateTier)
  template-config.ts          # Per-template crop configs for profile photos
  constants.ts                # Plan names, default limits, ADMIN_PAGINATION, subscription duration
  admin-utils.ts              # formatAdminDate, formatAdminDateFull, devError — shared admin utilities
  db.ts                       # getCurrentUser, checkUserLimits, duplicateResume (private getSystemSettings)
  system-settings.ts          # getSystemSettings (cached, 5-min TTL), updateSystemSettings, invalidateSettingsCache
  rtl.ts                      # isRTLText(), isResumeRTL() — Arabic/Kurdish detection
  ats-utils.ts                # Shared ATS utilities: stripHtml, buildResumeText, Zod schema, AI config, timeout
  quick-start-templates.ts    # 5 role-based pre-filled resume data for quick-start feature
  pdf/renderHtml.ts           # React SSR → HTML with embedded fonts
  pdf/generatePdf.ts          # Puppeteer HTML → PDF buffer

src/components/resume-builder/
  page.tsx                    # Main builder (3-column desktop, mobile responsive)
  ATSOptimization.tsx         # ATS modal wrapper (accessibility, caching, usage callback)
  QuickStartPicker.tsx        # Role-based template picker modal (5 templates, focus trap, i18n)
  ats/ScoreTab.tsx            # Score analysis tab (loading skeleton, score thresholds)
  ats/KeywordsTab.tsx         # Keyword matching tab (loading skeleton, importance badges)
  form/                       # 6 section components + FormSectionRenderer
  preview/                    # LivePreviewPanel, TemplateSwitcher, MobilePreviewSheet
  layout/CompletionProgressBar.tsx  # Overall resume completion bar (avg of 6 sections, color-coded, i18n)

src/components/admin/         # AdminDashboard + sub-components (stats, settings, users, resumes, payments)
  AdminAnalytics.tsx           # 4 Recharts charts (signups line, revenue bar, active users line, resumes bar)
  AdminErrorBoundary.tsx       # Error boundary wrapper for each admin section
  DeleteConfirmModal.tsx       # Reusable delete confirmation dialog (warning icon, item detail, red button)
  PaymentItem.tsx              # Single payment card + shared types (Payment, PaymentUser) + helpers (formatDate→formatAdminDate, formatAmount, statusBadgeClass)
  PaymentList.tsx              # Payment list with filters, search, pagination — renders PaymentItem + PaymentApprovalForm
  PaymentApprovalForm.tsx      # Review modal (screenshot, approve/reject, notes) — self-contained state
  AuditLogPanel.tsx            # Admin audit log viewer (filterable by action type)
src/contexts/SubscriptionContext.tsx  # Client provider for subscription + permissions
src/hooks/useAutoSave.ts      # Refs-based debounced auto-save
src/hooks/useDownloadPDF.ts   # PDF download with 403 → billing redirect

src/app/api/
  pdf/generate/               # POST: generate PDF (checks limits + template access)
  resumes/[id]/duplicate/     # POST: duplicate resume (checks limits + template fallback)
  admin/settings/             # GET/POST: system settings (auto-snapshots before save)
  admin/settings/history/     # GET: last 5 snapshots; POST: revert to snapshot
  admin/analytics/            # GET: 12-month time-series (signups, revenue, users, resumes)
  admin/stats/                # GET: platform metrics
  admin/users/                # GET: user listing; [userId]/upgrade POST
  subscriptions/check-expired/# GET: status; POST: process expired
  payments/submit/            # POST: submit payment (multipart, Telegram notification)
  payments/status/            # GET: user's payment history (array sorted by createdAt desc)
  admin/payments/             # GET: paginated admin payment listing with status filter
  admin/payments/[id]/review/ # GET: single payment + base64 screenshot; POST: approve/reject
  ats/score/                  # POST: ATS score analysis (rate limited, atomic limits)
  ats/keywords/               # POST: keyword matching (rate limited, atomic limits, 10K max)
  stats/public/               # GET: public stats (resumeCount, userCount) — 5min cache, no auth
  user/subscription-data/     # GET: subscription + permissions for client context
  user/onboarding-status/     # GET: check onboarding completion + resume count
  user/onboarding-complete/   # POST: create first resume + mark onboarding done
  user/onboarding-skip/       # POST: mark onboarding done without creating resume

src/app/onboarding/
  page.tsx                    # 3-step onboarding wizard (name → template → upload/scratch)

src/app/billing/
  page.tsx                    # Billing page (Free vs Pro pricing, payment status banners)
  payment-instructions/page.tsx # FIB payment flow (QR code, copy fields, screenshot upload)

src/app/admin/
  layout.tsx                  # Skip-to-content link + <main id="main-content"> wrapper
  payments/page.tsx           # Server component with admin guard → AdminPayments
```
